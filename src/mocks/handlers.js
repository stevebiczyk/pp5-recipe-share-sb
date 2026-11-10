import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("*/dj-rest-auth/user/", () => {
    return HttpResponse.json({
        pk: 1,
        username: "sbadmin",
        email: "",
        first_name: "",
        last_name: "",
        profile_id: 1,
        profile_image:
          "https://res.cloudinary.com/di4ba5hux/image/upload/v1/media/../girl_climbing_gxt5ti",
        profile_avatar:
          "https://res.cloudinary.com/di4ba5hux/image/upload/v1/media/../girl_climbing_gxt5ti",
      });
  }),
  http.post("*/dj-rest-auth/logout/", () => {
    return HttpResponse.json({ detail: "Logged out" });
  }),
  http.get("*/csrf/", () => HttpResponse.json({ csrfToken: "test-csrf-token" })),
  http.get("*/profiles/", () => HttpResponse.json({ results: [], count: 0, next: null })),
  http.get("*/recipes/", () => HttpResponse.json({ results: [], count: 0, next: null })),
];
