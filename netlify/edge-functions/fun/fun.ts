import * as wat from "fake-module";

export default async function handler(req) {
  console.log({ wat });
  return new Response("test " + wat.test);
}

export const config = {
  path: "/*",
};
