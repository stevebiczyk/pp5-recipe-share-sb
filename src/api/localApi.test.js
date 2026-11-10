import { localApiRequestUrl, usesLocalApiProxy } from "./localApi";
import { api } from "./axiosDefaults";

test.each(["localhost", "127.0.0.1"])("local API uses the proxy when the browser hostname is %s", (hostname) => {
  expect(usesLocalApiProxy("http://127.0.0.1:8000", hostname, true)).toBe(true);
  expect(usesLocalApiProxy("http://localhost:8000", hostname, true)).toBe(true);
});

test("production and remote APIs retain their configured origin", () => {
  expect(usesLocalApiProxy("http://127.0.0.1:8000", "localhost", false)).toBe(false);
  expect(usesLocalApiProxy("https://api.example.com", "localhost", true)).toBe(false);
  expect(usesLocalApiProxy("http://127.0.0.1:8000", "example.com", true)).toBe(false);
});

test("absolute pagination URLs stay on the local proxy without changing other origins", () => {
  expect(api.defaults.baseURL).toBe("/api/");
  expect(localApiRequestUrl("http://127.0.0.1:8000/recipes/?page=2", "http://127.0.0.1:8000")).toBe("/recipes/?page=2");
  expect(localApiRequestUrl("https://other.example/recipes/?page=2", "http://127.0.0.1:8000")).toBe("https://other.example/recipes/?page=2");
});
