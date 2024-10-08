import {Express} from "express";
import swaggerJSDoc, {Options} from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
export default function SetupSwagger(app: Express) {
  const options: Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "API doc - store",
        version: "1.0.0",
      },
      components: {
        schemas: {
          UserInput: {
            type: `object`,
            properties: {
              name: {type: `string`},
              email: {type: `string`, format: `email`},
              password: {type: `string`, format: `password`},
              avatar: {type: `string`},
              role: {type: `string`},
              isActive: {type: `boolean`},
            },
            required: [`name`, `email`, `password`, `role`],
          },
        },
      },
    },
    apis: ["./src/**/*.ts"],
  };
  const specs = swaggerJSDoc(options);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
}

//http://127.0.0.1:3000/api-docs/#/Users/post_auth_register
