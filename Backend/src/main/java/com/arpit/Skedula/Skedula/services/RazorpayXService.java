package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.dto.RazorpayXPayoutResult;
import com.arpit.Skedula.Skedula.entity.OwnerPayoutConfig;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.entity.Withdrawal;

public interface RazorpayXService {

    String getOrCreateContact(User owner);

    String getOrCreateFundAccount(User owner, OwnerPayoutConfig config);

    RazorpayXPayoutResult createPayout(Withdrawal withdrawal, String fundAccountId, String idempotencyKey);

    boolean verifyWebhookSignature(String rawBody, String signature);
}
