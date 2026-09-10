package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.dto.OwnerPayoutConfigDTO;
import com.arpit.Skedula.Skedula.dto.RazorpayXPayoutResult;
import com.arpit.Skedula.Skedula.dto.WithdrawalRequestDTO;
import com.arpit.Skedula.Skedula.dto.WithdrawalResponseDTO;
import com.arpit.Skedula.Skedula.entity.*;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import com.arpit.Skedula.Skedula.entity.enums.WithdrawalStatus;
import com.arpit.Skedula.Skedula.repository.OwnerPayoutConfigRepository;
import com.arpit.Skedula.Skedula.repository.WalletRepository;
import com.arpit.Skedula.Skedula.repository.WithdrawalRepository;
import com.arpit.Skedula.Skedula.services.Implementation.WithdrawalServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WithdrawalServiceTest {

    @Mock
    private WithdrawalRepository withdrawalRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private OwnerPayoutConfigRepository ownerPayoutConfigRepository;

    @Mock
    private RazorpayXService razorpayXService;

    @Mock
    private WalletTransactionService walletTransactionService;

    @InjectMocks
    private WithdrawalServiceImpl withdrawalService;

    private User testOwner;
    private Wallet testWallet;
    private OwnerPayoutConfig testPayoutConfig;

    @BeforeEach
    void setUp() {
        testOwner = new User();
        testOwner.setId(10L);
        testOwner.setName("Jane Business Owner");
        testOwner.setEmail("owner@skedula.test");
        testOwner.setRoles(Set.of(Role.OWNER));

        testWallet = Wallet.builder()
                .id(100L)
                .user(testOwner)
                .balance(BigDecimal.valueOf(1000.00))
                .reservedBalance(BigDecimal.ZERO)
                .build();

        testPayoutConfig = OwnerPayoutConfig.builder()
                .id(1L)
                .user(testOwner)
                .accountType("bank_account")
                .accountNumber("2323230041387700")
                .ifscCode("RAZR0000001")
                .razorpayContactId("cont_test_123")
                .razorpayFundAccountId("fa_test_456")
                .build();
    }

    @Test
    @DisplayName("1. Successful withdrawal initiation reserves balance and creates payout")
    void testSuccessfulWithdrawal() {
        when(walletRepository.findByUserWithLock(testOwner)).thenReturn(Optional.of(testWallet));
        when(ownerPayoutConfigRepository.findByUser(testOwner)).thenReturn(Optional.of(testPayoutConfig));
        when(razorpayXService.getOrCreateFundAccount(eq(testOwner), any())).thenReturn("fa_test_456");
        when(withdrawalRepository.save(any(Withdrawal.class))).thenAnswer(invocation -> {
            Withdrawal w = invocation.getArgument(0);
            if (w.getId() == null) w.setId(1L);
            return w;
        });
        when(razorpayXService.createPayout(any(), eq("fa_test_456"), anyString())).thenReturn(
                RazorpayXPayoutResult.builder()
                        .payoutId("pout_test_999")
                        .status("processing")
                        .amountInPaise(90000L)
                        .referenceId("WDR_TEST_1")
                        .build()
        );

        WithdrawalRequestDTO request = WithdrawalRequestDTO.builder()
                .amount(BigDecimal.valueOf(900.00))
                .build();

        WithdrawalResponseDTO response = withdrawalService.requestWithdrawal(testOwner, request);

        assertNotNull(response);
        assertEquals(0, response.getAmount().compareTo(BigDecimal.valueOf(900.00)));
        assertEquals("PROCESSING", response.getStatus());
        assertEquals("pout_test_999", response.getPayoutId());

        // Verify wallet accounting: Available = 100, Reserved = 900
        assertEquals(0, testWallet.getBalance().compareTo(BigDecimal.valueOf(100.00)));
        assertEquals(0, testWallet.getReservedBalance().compareTo(BigDecimal.valueOf(900.00)));
        verify(walletRepository, atLeastOnce()).save(testWallet);
    }

    @Test
    @DisplayName("2. Insufficient balance throws IllegalArgumentException and does not alter wallet")
    void testInsufficientBalanceFails() {
        testWallet.setBalance(BigDecimal.valueOf(500.00));
        when(walletRepository.findByUserWithLock(testOwner)).thenReturn(Optional.of(testWallet));

        WithdrawalRequestDTO request = WithdrawalRequestDTO.builder()
                .amount(BigDecimal.valueOf(900.00))
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                withdrawalService.requestWithdrawal(testOwner, request)
        );

        assertTrue(ex.getMessage().contains("Insufficient withdrawable balance"));
        assertEquals(0, testWallet.getBalance().compareTo(BigDecimal.valueOf(500.00)));
        assertEquals(0, testWallet.getReservedBalance().compareTo(BigDecimal.ZERO));
        verify(razorpayXService, never()).createPayout(any(), any(), any());
    }

    @Test
    @DisplayName("3. Zero or negative withdrawal amounts are rejected")
    void testZeroOrNegativeAmountFails() {
        WithdrawalRequestDTO zeroRequest = WithdrawalRequestDTO.builder()
                .amount(BigDecimal.ZERO)
                .build();

        assertThrows(IllegalArgumentException.class, () ->
                withdrawalService.requestWithdrawal(testOwner, zeroRequest)
        );

        WithdrawalRequestDTO negativeRequest = WithdrawalRequestDTO.builder()
                .amount(BigDecimal.valueOf(-100.00))
                .build();

        assertThrows(IllegalArgumentException.class, () ->
                withdrawalService.requestWithdrawal(testOwner, negativeRequest)
        );
    }

    @Test
    @DisplayName("4. Razorpay payout API exception fails gracefully and refunds reserved balance to available balance")
    void testRazorpayPayoutApiFailureRefundsBalance() {
        when(walletRepository.findByUserWithLock(testOwner)).thenReturn(Optional.of(testWallet));
        when(ownerPayoutConfigRepository.findByUser(testOwner)).thenReturn(Optional.of(testPayoutConfig));
        when(razorpayXService.getOrCreateFundAccount(eq(testOwner), any())).thenReturn("fa_test_456");
        when(withdrawalRepository.save(any(Withdrawal.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(razorpayXService.createPayout(any(), any(), anyString())).thenThrow(new RuntimeException("Simulated Network Timeout"));

        WithdrawalRequestDTO request = WithdrawalRequestDTO.builder()
                .amount(BigDecimal.valueOf(300.00))
                .build();

        WithdrawalResponseDTO response = withdrawalService.requestWithdrawal(testOwner, request);

        assertEquals("FAILED", response.getStatus());
        assertEquals("Simulated Network Timeout", response.getFailureReason());

        // Balance restored back to 1000, Reserved restored to 0
        assertEquals(0, testWallet.getBalance().compareTo(BigDecimal.valueOf(1000.00)));
        assertEquals(0, testWallet.getReservedBalance().compareTo(BigDecimal.ZERO));
    }

    @Test
    @DisplayName("5. Webhook payout.processed settles withdrawal and clears reserved balance")
    void testPayoutProcessedWebhook() {
        Withdrawal withdrawal = Withdrawal.builder()
                .id(1L)
                .user(testOwner)
                .amount(BigDecimal.valueOf(600.00))
                .status(WithdrawalStatus.PROCESSING)
                .payoutId("pout_111")
                .referenceId("WDR_111")
                .build();

        testWallet.setBalance(BigDecimal.valueOf(400.00));
        testWallet.setReservedBalance(BigDecimal.valueOf(600.00));

        when(razorpayXService.verifyWebhookSignature(anyString(), anyString())).thenReturn(true);
        when(withdrawalRepository.findByPayoutId("pout_111")).thenReturn(Optional.of(withdrawal));
        when(walletRepository.findByUserWithLock(testOwner)).thenReturn(Optional.of(testWallet));

        String payload = """
                {
                  "event": "payout.processed",
                  "payload": {
                    "payout": {
                      "entity": {
                        "id": "pout_111",
                        "status": "processed",
                        "reference_id": "WDR_111"
                      }
                    }
                  }
                }
                """;

        withdrawalService.handlePayoutWebhook(payload, "valid_sig");

        assertEquals(WithdrawalStatus.COMPLETED, withdrawal.getStatus());
        assertNotNull(withdrawal.getProcessedAt());
        // Reserved cleared to 0, available remains 400
        assertEquals(0, testWallet.getReservedBalance().compareTo(BigDecimal.ZERO));
        assertEquals(0, testWallet.getBalance().compareTo(BigDecimal.valueOf(400.00)));
    }

    @Test
    @DisplayName("6. Webhook payout.reversed refunds reserved amount back to owner available balance")
    void testPayoutReversedWebhook() {
        Withdrawal withdrawal = Withdrawal.builder()
                .id(2L)
                .user(testOwner)
                .amount(BigDecimal.valueOf(500.00))
                .status(WithdrawalStatus.PROCESSING)
                .payoutId("pout_222")
                .referenceId("WDR_222")
                .build();

        testWallet.setBalance(BigDecimal.valueOf(500.00));
        testWallet.setReservedBalance(BigDecimal.valueOf(500.00));

        when(razorpayXService.verifyWebhookSignature(anyString(), anyString())).thenReturn(true);
        when(withdrawalRepository.findByPayoutId("pout_222")).thenReturn(Optional.of(withdrawal));
        when(walletRepository.findByUserWithLock(testOwner)).thenReturn(Optional.of(testWallet));

        String payload = """
                {
                  "event": "payout.reversed",
                  "payload": {
                    "payout": {
                      "entity": {
                        "id": "pout_222",
                        "status": "reversed",
                        "reference_id": "WDR_222",
                        "error_description": "Beneficiary account blocked"
                      }
                    }
                  }
                }
                """;

        withdrawalService.handlePayoutWebhook(payload, "valid_sig");

        assertEquals(WithdrawalStatus.REVERSED, withdrawal.getStatus());
        assertTrue(withdrawal.getFailureReason().contains("Beneficiary account blocked"));
        // Reserved cleared to 0, available restored to 1000
        assertEquals(0, testWallet.getReservedBalance().compareTo(BigDecimal.ZERO));
        assertEquals(0, testWallet.getBalance().compareTo(BigDecimal.valueOf(1000.00)));
    }

    @Test
    @DisplayName("7. Duplicate webhook processing is idempotent and does not modify balance twice")
    void testDuplicateWebhookIdempotency() {
        Withdrawal alreadyCompleted = Withdrawal.builder()
                .id(3L)
                .user(testOwner)
                .amount(BigDecimal.valueOf(400.00))
                .status(WithdrawalStatus.COMPLETED)
                .payoutId("pout_333")
                .referenceId("WDR_333")
                .processedAt(LocalDateTime.now())
                .build();

        testWallet.setBalance(BigDecimal.valueOf(600.00));
        testWallet.setReservedBalance(BigDecimal.ZERO);

        when(razorpayXService.verifyWebhookSignature(anyString(), anyString())).thenReturn(true);
        when(withdrawalRepository.findByPayoutId("pout_333")).thenReturn(Optional.of(alreadyCompleted));

        String payload = """
                {
                  "event": "payout.processed",
                  "payload": {
                    "payout": {
                      "entity": {
                        "id": "pout_333",
                        "status": "processed"
                      }
                    }
                  }
                }
                """;

        withdrawalService.handlePayoutWebhook(payload, "valid_sig");

        // Wallet was NOT locked/modified since already COMPLETED
        verify(walletRepository, never()).findByUserWithLock(any());
        assertEquals(0, testWallet.getBalance().compareTo(BigDecimal.valueOf(600.00)));
        assertEquals(0, testWallet.getReservedBalance().compareTo(BigDecimal.ZERO));
    }

    @Test
    @DisplayName("8. Invalid webhook signature throws SecurityException")
    void testInvalidWebhookSignatureThrowsException() {
        when(razorpayXService.verifyWebhookSignature(anyString(), anyString())).thenReturn(false);

        assertThrows(SecurityException.class, () ->
                withdrawalService.handlePayoutWebhook("{}", "bad_sig")
        );
    }
}
