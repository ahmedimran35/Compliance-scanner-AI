import Stripe from 'stripe';
interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
    features: string[];
    limits: {
        scans: number;
        projects: number;
    };
}
declare class StripeService {
    private static instance;
    static getInstance(): StripeService;
    /**
     * Create a Stripe customer
     */
    createCustomer(user: any): Promise<Stripe.Customer>;
    /**
     * Create a checkout session for subscription
     */
    createCheckoutSession(user: any, planId: string): Promise<Stripe.Checkout.Session>;
    /**
     * Get or create Stripe price for a plan
     */
    private getOrCreatePrice;
    /**
     * Handle webhook events
     */
    handleWebhook(event: Stripe.Event): Promise<void>;
    /**
     * Handle successful checkout completion
     */
    private handleCheckoutCompleted;
    /**
     * Handle subscription updates
     */
    private handleSubscriptionUpdated;
    /**
     * Handle subscription deletion
     */
    private handleSubscriptionDeleted;
    /**
     * Handle payment failures
     */
    private handlePaymentFailed;
    /**
     * Create a customer portal session
     */
    createPortalSession(user: any): Promise<Stripe.BillingPortal.Session>;
    /**
     * Get subscription plans
     */
    getSubscriptionPlans(): SubscriptionPlan[];
    /**
     * Get plan by ID
     */
    getPlanById(planId: string): SubscriptionPlan | null;
}
declare const _default: StripeService;
export default _default;
//# sourceMappingURL=stripeService.d.ts.map