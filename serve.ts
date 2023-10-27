import { Router } from "@stricjs/router";
import { file, dir } from "@stricjs/utils";

export default new Router()
  .get("/", file("./frontend/index.html"))
  .get("/*", dir("./build/frontend/"));
