import { rest } from "msw";

export const handlers = [
  rest.get("*/dj-rest-auth/user/", (req, res, ctx) => {
    return res(
      ctx.json({
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
      })
    );
  }),
  rest.post("*/dj-rest-auth/logout/", (req, res, ctx) => {
    return res(ctx.status(200));
  }),
];
