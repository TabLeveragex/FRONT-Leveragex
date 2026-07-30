import React from 'react';
import '../styles/termandcondition.css';

 // Ensure this file exists for styling

const TermsAndConditions = () => {
  return (
    <div className="terms-container">
      <h1>Terms and Conditions</h1>

      <h2>1. Introduction</h2>
      <p>These Terms and Conditions govern the use of the Rapid, Evolution, and Prime trading plans provided by  <b>LeverageX</b>. By purchasing or subscribing to any of these plans, the customer agrees to the following terms, including rules regarding trading, payouts, loss limits, and profit-sharing.</p>

      <h2>2. Service Plans</h2>
      <p><b> Rapid</b> <br /> Overview: The Rapid plan is a one-time-use plan aimed at building customer trust. It offers limited trading access and can only be purchased once.<br />
        Features:<br />Single-use plan<br /> Basic trading functionality <br />Limited customer support (email only, 48-hour response time)<br /> Usage:<br /> Rapid is a one-time plan and cannot be repurchased once used.<br />Customers are required to trade for a minimum of five trading days before requesting a payout.Loss Limit: 10% of the total account balance (e.g., INR 1,000 loss on an INR 10,000 account).<br />Profit-Sharing: The company retains 50% of the profits generated from this plan as a service charge during payouts.<br />
 <b>Evolution</b><br />
Overview: The Evolution plan is a multi-use plan that provides access to advanced trading tools and can be purchased multiple times.<br />
Features:<br />
Intermediate-level trading access<br />
Priority customer support (email and chat, 24-hour response time)<br />
Usage:<br />
Evolution can be purchased multiple times, without limit.<br />
Customers must complete five trading days before being eligible for a payout.<br />
Loss Limit:<br /> 10% of the total account balance (e.g., INR 5,000 loss on an INR 50,000 account).<br />
Profit-Sharing: The company retains 50% of the profits generated from this plan as a service charge during payouts.<br />
 <b>Prime</b><br />
Overview: The Prime plan is the premium offering that provides full access to trading tools and resources. This plan can also be purchased multiple times.<br />
Features:<br />
Full access to advanced trading tools<br />
VIP customer support (24/7 phone, chat, and email)<br />
Highest level of trading functionality<br />
Usage:<br />
Prime can be purchased multiple times, with no restrictions on re-purchase.<br />
Customers must complete a minimum of five trading days before requesting a payout.<br />
Loss Limit: 10% of the total account balance (e.g., INR 10,000 loss on an INR 100,000 account).<br />
Profit-Sharing: The company retains 50% of the profits generated from this plan as a service charge during payouts.</p><br />

      <h2>3. Payout Conditions</h2>
      <p>Five Trading Days Requirement: For all plans (Rapid, Evolution, and Prime), the customer must trade for at least five consecutive trading days before being eligible to request a payout.<br />
Profit-Sharing Structure: Upon successful completion of the trading period, if the customer is profitable, the company will retain 50% of the profits as a service charge. The remaining 50% will be paid out to the customer. <br />
Payout Requests: Customers can submit a payout request after the completion of the minimum five-day trading period, provided the account remains within the specified loss limits.</p>

      <h2>4. Loss Limits</h2>
      <p>Each plan includes a strict 10% loss limit on the trading account balance:
        <br /><b>
        Rapid: INR 1,000 loss on a INR 10,000 account.<br />
        Evolution: INR 5,000 loss on a INR 50,000 account.<br />
        Prime: INR 10,000 loss on a INR 100,000 account.<br />
        </b>
        If the account reaches the 10% loss limit, trading activity will be halted, and the customer will not be eligible for a payout.
      </p>

      <h2>5. Customer Responsibility for Profit and Loss</h2>
    <p>
    <b>
    Risk and Responsibility:  </b> All profits and losses are the sole responsibility of the customer. The company provides tools and platforms for trading but does not guarantee profitability.<br />

    <b>Losses:</b> If the customer's trading activity results in a loss that reaches the defined loss limit (10% of the account balance), the trading account will be deactivated for that plan.
    </p>

      <h2>6.  Refund Policy</h2>
      <p> <b>Rapid Plan:</b> As this is a one-time-use plan, refunds are not applicable once the plan has been purchased and trading has begun.<br />
      :<b>Evolution and Prime Plans:</b> Refunds are only available if the plan has not been used for trading. Once trading begins, the plan is non-refundable.</p>

      <h2>7. Service Termination and Account Suspension</h2>
      <p><b>Loss Limit Breach:</b>If the 10% loss limit is breached, the customer's trading account will be suspended, and they will no longer be eligible for payouts under the active plan.<br />
       <b>Misuse or Fraudulent Activity:</b>The company reserves the right to terminate accounts and withhold payouts if any misuse or fraudulent activity is detected.</p>

      <h2>8. Changes to Services</h2>
      <p>The company reserves the right to modify or discontinue any service plan (Rapid, Evolution, or Prime) at any time, with prior notice to customers.
        <br />
      Any changes in pricing, loss limits, or payout structure will be communicated in advance and will apply to future plan purchases, not active plans.</p>

      <h2>9. Governing Law </h2>
      <p>These terms and conditions are governed by and construed in accordance with the laws of [Your Jurisdiction]. Any disputes arising out of or relating to these terms will be subject to the exclusive jurisdiction of the courts in [Your Location].</p>

      <h2>10.Contact Information</h2>
      <p>For any inquiries, issues, or further clarification on these Terms and Conditions, please contact us at leveragexfund@gmail.com.</p>
    </div>


  );
};

export default TermsAndConditions;

