# Bollywood Music Learning

## Current State

The platform has a fully functional Bollywood music course marketplace with:
- Course catalog, detail pages, course player, student dashboard, admin panel
- Stripe-only payment integration via `createCoursePaymentSession` backend call
- Authorization via Internet Identity
- Single "Enroll Now" button on CourseDetailPage that redirects to Stripe Checkout

## Requested Changes (Diff)

### Add
- `PaymentMethodSelector` component: a modal/sheet that displays all supported payment gateways as selectable tiles before checkout
- Payment gateway options: PhonePe, Paytm, Google Pay, PayPal, Stripe, Credit/Debit Card
- `PaymentGatewayPage` (`/payment-gateway`): a dedicated page shown after selecting a UPI method (PhonePe, Paytm) with instructions and a QR code placeholder, course ID in query params
- Payment method icons/logos for each gateway (generated images or SVG inline)
- "Secure payment" trust badge section beneath the payment selector

### Modify
- `CourseDetailPage`: replace the direct Stripe redirect on "Enroll Now" click with opening the `PaymentMethodSelector` modal/sheet
- The Stripe, Credit/Debit Card, and Google Pay/PayPal options in the selector trigger the existing Stripe checkout flow (Stripe supports all of these natively)
- PhonePe and Paytm options navigate to `/payment-gateway?method=phonepe&courseId=...` or `/payment-gateway?method=paytm&courseId=...`

### Remove
- Nothing removed from backend

## Implementation Plan

1. Generate payment gateway logo images (PhonePe, Paytm, Google Pay, PayPal, Stripe, Card)
2. Create `PaymentMethodSelector` component with a Dialog containing gateway tiles
3. Update `CourseDetailPage` to open the selector dialog instead of directly calling Stripe
4. Create `PaymentGatewayPage` for UPI-based methods with QR instructions
5. Add `/payment-gateway` route to `App.tsx`
6. Validate and deploy
