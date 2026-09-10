package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.dto.RazorpayXPayoutResult;
import com.arpit.Skedula.Skedula.entity.OwnerPayoutConfig;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.entity.Withdrawal;
import com.arpit.Skedula.Skedula.repository.OwnerPayoutConfigRepository;
import com.arpit.Skedula.Skedula.services.RazorpayXService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HexFormat;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RazorpayXServiceImpl implements RazorpayXService {

    private final OwnerPayoutConfigRepository ownerPayoutConfigRepository;

    @Value("${razorpayx.keyId:${razorpay.keyId:rzp_test_1osnPBeF2xSAFe}}")
    private String keyId;

    @Value("${razorpayx.keySecret:${razorpay.secret.key:j56sb6intnUIua5oyE5mKvwe}}")
    private String keySecret;

    @Value("${razorpayx.accountNumber:2323230041387700}")
    private String accountNumber;

    @Value("${razorpayx.webhookSecret:test_payout_webhook_secret_9988}")
    private String webhookSecret;

    @Value("${razorpayx.testMode:true}")
    private boolean testMode;

    private static final String BASE_URL = "https://api.razorpay.com/v1";

    private RestTemplate getRestTemplate() {
        return new RestTemplateBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .readTimeout(Duration.ofSeconds(15))
                .basicAuthentication(keyId, keySecret)
                .build();
    }

    @Override
    public String getOrCreateContact(User user) {
        OwnerPayoutConfig config = ownerPayoutConfigRepository.findByUser(user).orElse(null);
        if (config != null && config.getRazorpayContactId() != null && !config.getRazorpayContactId().isBlank()) {
            return config.getRazorpayContactId();
        }

        String contactId = null;
        try {
            JSONObject body = new JSONObject();
            String name = user.getName() != null && !user.getName().isBlank() ? user.getName() : "Skedula Member";
            String email = user.getEmail() != null && !user.getEmail().isBlank() ? user.getEmail() : "user" + user.getId() + "@skedula.com";
            String phone = "9876543210";

            body.put("name", name);
            body.put("email", email);
            body.put("contact", phone);
            body.put("type", "customer");
            body.put("reference_id", "USER_" + user.getId());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(body.toString(), headers);

            ResponseEntity<String> response = getRestTemplate().postForEntity(BASE_URL + "/contacts", entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JSONObject resJson = new JSONObject(response.getBody());
                contactId = resJson.optString("id");
                log.info("Created RazorpayX Contact: {} for User ID: {}", contactId, user.getId());
            }
        } catch (Exception e) {
            log.warn("RazorpayX Contact creation API returned: {}. Generating contact in testMode={}", e.getMessage(), testMode);
            if (testMode) {
                contactId = "cont_test_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
            } else {
                throw new RuntimeException("Failed to create RazorpayX contact: " + e.getMessage(), e);
            }
        }

        if (config == null) {
            config = OwnerPayoutConfig.builder()
                    .user(user)
                    .beneficiaryName(user.getName())
                    .accountType("bank_account")
                    .razorpayContactId(contactId)
                    .build();
        } else {
            config.setRazorpayContactId(contactId);
        }
        ownerPayoutConfigRepository.save(config);
        return contactId;
    }

    @Override
    public String getOrCreateFundAccount(User user, OwnerPayoutConfig config) {
        if (config != null && config.getRazorpayFundAccountId() != null && !config.getRazorpayFundAccountId().isBlank()) {
            return config.getRazorpayFundAccountId();
        }

        if (config == null) {
            throw new IllegalArgumentException("Payout bank or UPI account details must be configured before requesting a withdrawal.");
        }

        String contactId = getOrCreateContact(user);
        String fundAccountId = null;

        try {
            JSONObject body = new JSONObject();
            body.put("contact_id", contactId);

            boolean isVpa = "vpa".equalsIgnoreCase(config.getAccountType());
            if (isVpa) {
                if (config.getVpaAddress() == null || config.getVpaAddress().isBlank()) {
                    throw new IllegalArgumentException("Valid UPI ID (VPA) is required.");
                }
                body.put("account_type", "vpa");
                JSONObject vpa = new JSONObject();
                vpa.put("address", config.getVpaAddress());
                body.put("vpa", vpa);
            } else {
                if (config.getAccountNumber() == null || config.getAccountNumber().isBlank() ||
                    config.getIfscCode() == null || config.getIfscCode().isBlank()) {
                    throw new IllegalArgumentException("Valid Bank Account Number and IFSC code are required.");
                }
                body.put("account_type", "bank_account");
                JSONObject bankAccount = new JSONObject();
                bankAccount.put("name", config.getBeneficiaryName() != null ? config.getBeneficiaryName() : user.getName());
                bankAccount.put("ifsc", config.getIfscCode().toUpperCase());
                bankAccount.put("account_number", config.getAccountNumber());
                body.put("bank_account", bankAccount);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(body.toString(), headers);

            ResponseEntity<String> response = getRestTemplate().postForEntity(BASE_URL + "/fund_accounts", entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JSONObject resJson = new JSONObject(response.getBody());
                fundAccountId = resJson.optString("id");
                log.info("Created RazorpayX Fund Account: {} for Contact: {}", fundAccountId, contactId);
            }
        } catch (IllegalArgumentException iae) {
            throw iae;
        } catch (Exception e) {
            log.warn("RazorpayX Fund Account creation API returned: {}. Generating fund account in testMode={}", e.getMessage(), testMode);
            if (testMode) {
                fundAccountId = "fa_test_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
            } else {
                throw new RuntimeException("Failed to create RazorpayX fund account: " + e.getMessage(), e);
            }
        }

        config.setRazorpayFundAccountId(fundAccountId);
        config.setRazorpayContactId(contactId);
        ownerPayoutConfigRepository.save(config);

        return fundAccountId;
    }

    @Override
    public RazorpayXPayoutResult createPayout(Withdrawal withdrawal, String fundAccountId, String idempotencyKey) {
        long amountInPaise = withdrawal.getAmount().multiply(BigDecimal.valueOf(100)).longValue();
        String referenceId = withdrawal.getReferenceId() != null ? withdrawal.getReferenceId() : "WDR_" + withdrawal.getId();

        try {
            JSONObject body = new JSONObject();
            body.put("account_number", accountNumber);
            body.put("fund_account_id", fundAccountId);
            body.put("amount", amountInPaise);
            body.put("currency", withdrawal.getCurrency() != null ? withdrawal.getCurrency() : "INR");
            body.put("mode", "IMPS");
            body.put("purpose", "payout");
            body.put("queue_if_low_balance", true);
            body.put("reference_id", referenceId);
            body.put("narration", "Skedula Business Withdrawal");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Payout-Idempotency", idempotencyKey);
            HttpEntity<String> entity = new HttpEntity<>(body.toString(), headers);

            log.info("Calling RazorpayX Test Payout API: ref={}, amountInPaise={}, idempotencyKey={}", referenceId, amountInPaise, idempotencyKey);
            ResponseEntity<String> response = getRestTemplate().postForEntity(BASE_URL + "/payouts", entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JSONObject resJson = new JSONObject(response.getBody());
                String payoutId = resJson.optString("id");
                String status = resJson.optString("status", "processing");
                log.info("RazorpayX Payout initiated successfully: payoutId={}, status={}", payoutId, status);

                return RazorpayXPayoutResult.builder()
                        .payoutId(payoutId)
                        .status(status)
                        .referenceId(referenceId)
                        .mode("IMPS")
                        .amountInPaise(amountInPaise)
                        .build();
            } else {
                throw new RuntimeException("Unexpected response status from RazorpayX: " + response.getStatusCode());
            }
        } catch (HttpStatusCodeException e) {
            log.error("RazorpayX Payout HTTP Error [{}]: {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (testMode) {
                // In test mode with dummy credentials or sandbox quota, simulate successful payout creation
                String simulatedPayoutId = "pout_test_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
                log.info("Test Mode: Fallback simulated payout created: {}", simulatedPayoutId);
                return RazorpayXPayoutResult.builder()
                        .payoutId(simulatedPayoutId)
                        .status("processing")
                        .referenceId(referenceId)
                        .mode("IMPS")
                        .amountInPaise(amountInPaise)
                        .build();
            }
            throw new RuntimeException("RazorpayX Payout API error: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("Failed to execute RazorpayX Payout: {}", e.getMessage(), e);
            if (testMode) {
                String simulatedPayoutId = "pout_test_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
                log.info("Test Mode: Fallback simulated payout created after exception: {}", simulatedPayoutId);
                return RazorpayXPayoutResult.builder()
                        .payoutId(simulatedPayoutId)
                        .status("processing")
                        .referenceId(referenceId)
                        .mode("IMPS")
                        .amountInPaise(amountInPaise)
                        .build();
            }
            throw new RuntimeException("RazorpayX payout error: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean verifyWebhookSignature(String rawBody, String signature) {
        if (signature == null || signature.isBlank() || rawBody == null) {
            return false;
        }
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] hash = sha256_HMAC.doFinal(rawBody.getBytes(StandardCharsets.UTF_8));
            String calculatedSignature = HexFormat.of().formatHex(hash);

            return MessageDigest.isEqual(
                    calculatedSignature.getBytes(StandardCharsets.UTF_8),
                    signature.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("Error verifying RazorpayX webhook signature: {}", e.getMessage(), e);
            return false;
        }
    }
}
