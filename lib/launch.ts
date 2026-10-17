export function isBookingLaunchReady() {
  return process.env.BOOKING_LAUNCH_READY === "true"
    && Boolean(process.env.NEXT_PUBLIC_OPERATOR_NAME)
    && Boolean(process.env.NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL);
}
