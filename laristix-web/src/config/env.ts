export const env = {
  // Empty string = same-origin (via Next.js rewrites in next.config.mjs)
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  midtransClientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "",
  midtransIsProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true",
} as const;

export const apiPaths = {
  csrfCookie: "/sanctum/csrf-cookie",
  auth: {
    register: "/api/v1/auth/register",
    login: "/api/v1/auth/login",
    logout: "/api/v1/auth/logout",
    me: "/api/v1/auth/me",
    forgotPassword: "/api/v1/auth/forgot-password",
    resetPassword: "/api/v1/auth/reset-password",
    verificationNotice: "/api/v1/auth/email/verification-notification",
    resendVerification: "/api/v1/auth/email/resend-verification",
    verifyEmail: (id: string, hash: string) => `/api/v1/auth/email/verify/${id}/${hash}`,
    organizers: "/api/v1/auth/organizers",
    switchOrganizer: "/api/v1/auth/organizer/switch",
    tokens: "/api/v1/auth/tokens",
    tokensCurrent: "/api/v1/auth/tokens/current",
  },
  events: {
    list: "/api/v1/events",
    create: "/api/v1/events",
    show: (uuid: string) => `/api/v1/events/${uuid}`,
    update: (uuid: string) => `/api/v1/events/${uuid}`,
    delete: (uuid: string) => `/api/v1/events/${uuid}`,
    publish: (uuid: string) => `/api/v1/events/${uuid}/publish`,
    draft: (uuid: string) => `/api/v1/events/${uuid}/draft`,
    adminList: "/api/v1/admin/events",
    publicList: "/api/v1/public/events",
    publicShow: (uuid: string) => `/api/v1/public/events/${uuid}`,
  },
  venues: {
    list: "/api/v1/venues",
  },
  eventCategories: "/api/v1/event-categories",
  ticketTypes: {
    list: (eventUuid: string) => `/api/v1/events/${eventUuid}/ticket-types`,
    create: (eventUuid: string) => `/api/v1/events/${eventUuid}/ticket-types`,
    show: (eventUuid: string, ticketTypeId: number) =>
      `/api/v1/events/${eventUuid}/ticket-types/${ticketTypeId}`,
    update: (eventUuid: string, ticketTypeId: number) =>
      `/api/v1/events/${eventUuid}/ticket-types/${ticketTypeId}`,
    delete: (eventUuid: string, ticketTypeId: number) =>
      `/api/v1/events/${eventUuid}/ticket-types/${ticketTypeId}`,
    publicList: (eventUuid: string) => `/api/v1/public/events/${eventUuid}/ticket-types`,
  },
  organizers: {
    create: "/api/v1/organizers",
  },
  checkout: {
    create: (eventUuid: string) => `/api/v1/public/events/${eventUuid}/checkout`,
    listOrders: "/api/v1/public/orders",
    showOrder: (uuid: string) => `/api/v1/public/orders/${uuid}`,
    validatePayment: (uuid: string) => `/api/v1/public/orders/${uuid}/validate-payment`,
  },
} as const;

export const routes = {
  home: "/",
  publicEvent: (uuid: string) => `/events/${uuid}`,
  publicEventCheckout: (uuid: string, ticketTypeId: number) =>
    `/events/${uuid}/checkout?ticket=${ticketTypeId}`,
  checkoutFinish: (orderUuid: string) => `/checkout/${orderUuid}/finish`,
  myTickets: "/my/tickets",
  login: "/login",
  loginWithRedirect: (redirect: string) =>
    `/login?redirect=${encodeURIComponent(redirect)}`,
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  verifyEmailConfirm: "/verify-email/confirm",
  verifyEmailPending: "/verify-email/pending",
  selectOrganizer: "/select-organizer",
  createOrganizer: "/create-organizer",
  organizerDashboard: "/dashboard",
  organizerEvents: "/events",
  organizerEventNew: "/events/new",
  organizerEventEdit: (uuid: string) => `/events/${uuid}/edit`,
  organizerEventTickets: (uuid: string) => `/events/${uuid}/tickets`,
  organizerEventTicketNew: (uuid: string) => `/events/${uuid}/tickets/new`,
  organizerEventTicketEdit: (eventUuid: string, ticketId: number) =>
    `/events/${eventUuid}/tickets/${ticketId}/edit`,
  adminDashboard: "/admin/dashboard",
  adminEvents: "/admin/events",
  scanner: "/scan",
} as const;

export const roleRoutes: Record<string, string> = {
  super_admin: routes.adminDashboard,
  organizer: routes.organizerDashboard,
  staff: routes.organizerDashboard,
  participant: routes.home,
};
