import { Hono } from "hono";
import { connect } from "@planetscale/database";

import Jsonnet from "@arakoodev/jsonnet";

let jsonnet = new Jsonnet();

const app = new Hono();

function greet() {
  return "Hello from JS";
}

const env = {};

app.get("/hello", (c) => {
    return c.text("Hello World!");
});

app.get("/", (c) => {
    const code = `
  local username = std.extVar('name');
  local Person(name='Alice') = {
    name: name,
    welcome: 'Hello ' + name + '!',
  };
  {
    person1: Person(username),
    person2: Person('Bob'),
  }`;
    let result = jsonnet.extString("name", "ll").evaluateSnippet(code);
    return c.json(JSON.parse(result));
});

app.get("/func", (c) => {
  const code = `
  local username = std.extVar('name');
  local Person(name='Alice') = {
    name: name,
    welcome: 'Hello ' + name + '!',
  };
  {
    person1: Person(username),
    person2: Person('Bob'),
    result : arakoo.native("greet")()
  }`;
  let result = jsonnet.extString("name", "ll").javascriptCallback("greet", greet).evaluateSnippet(code);
  return c.json(JSON.parse(result));
});

app.get("/add", (c) => {
  function add(arg1, arg2, arg3) {
    console.log("Args recieved: ", arg1, arg2, arg3);
    return arg1 + arg2 + arg3;
  }
  const code = `
  local username = std.extVar('name');
  local Person(name='Alice') = {
    name: name,
    welcome: 'Hello ' + name + '!',
  };
  {
    person1: Person(username),
    person2: Person('Bob'),
    result : arakoo.native("add")(1,2,3)
  }`;
  let result = jsonnet.extString("name", "ll").javascriptCallback("add", add).evaluateSnippet(code);
  return c.json(JSON.parse(result));
});

app.get("/file", (c) => {
    try {
        let result = jsonnet
            .extString("extName", "Mohan")
            .evaluateFile(
                "/home/afshan/EdgeChains/JS/wasm/examples/ec-wasmjs-hono/src/example.jsonnet"
            );
        return c.json(JSON.parse(result));
    } catch (error) {
        console.log("Error occured");
        console.log(error);
        return c.json("Unable to evaluate File");
    }
});

app.get("/:username", (c) => {
    const { username } = c.req.param();
    // redirect to /hello/:username
    return c.redirect(`/hello/${username}`);
});

app.get("/hello/:name", async (c) => {
    const name = c.req.param("name");
    return c.text(`Async Hello ${name}!`);
});

app.get("/env/:key", async (c) => {
    const key = c.req.param("key");
    return c.text(env[key]);
});

const config = {
    host: env["PLANETSCALE_HOST"],
    username: env["PLANETSCALE_USERNAME"],
    password: env["PLANETSCALE_PASSWORD"],
};
const conn = connect(config);

app.get("/db", async (c) => {
    const result = await conn.execute("SHOW TABLES");

    return c.json(result);
});

app.notFound((c) => {
    return c.text("404 not found", 404);
});

// app.fire();
globalThis._export = app;
