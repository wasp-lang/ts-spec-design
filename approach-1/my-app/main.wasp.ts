import { AppSpec, Spec, jsImport } from "@wasp/sdk";
import { loginPage } from "@wasp/sdk/auth";
import fileUploadModule from "file-upload-module"; // Let's say this is set up in package.json or somewhere.
import adminSpec from "./admin.wasp.ts";

// Here I went for "express-style, organized under Spec" approach.
// Similar to what Filip did with `new Module`, but I named it Spec and did some small changes.
// The idea is that instead of having each route/page/... standalone, they are defined as part of a
// Spec object, where they are immediately "registered", so you don't have to register each one
// additionaly on its own later.
// Instead, you have these Spec objects, which are logical parts of the big AppSpec, that you can
// move around, combine, manipulate.
// Main .wasp.ts file needs to export default an AppSpec.

const spec = new AppSpec("MyApp", { // AppSpec extends Spec.
  auth: { google: {} } // Auth can be defined only on AppSpec, not normal Spec.
});
// ^ Alternative design for above is doing new Spec, defining stuff via it,
// and then at the end doing new App("MyApp", spec, { auth: ..., ... });

const mainPage = spec.page({
  // I imagined that `jsImport` is a function that at the moment of calling checks current
  // file/script path and based on it turns the relative path into (more) absolute path.
  // Maybe we could even have Typescript have correct type for the possible values,
  // based on state of the files on the disk? Maybe we generate these types or use tsc plugin?
  // And then we even get autocomplete and type safety that way?
  // I know the main idea is doing fake "normal" imports, but wanted to explore this as an alternative.
  component: jsImport("MainPage.tsx"),
  authRequired: true
});

spec.route("/login", loginPage);
spec.route("/main", mainPage);

spec.query({
  fn: jsImport("getTasks", "queries.ts"),
  entities: ["Task"]
});

spec.use(adminSpec);

// TODO(FSM):
// Figure this out. This is where it gets confusing.
// Right now I made the whole fileUploadModule be defined as one big spec and just used it whole here.
// But then I can't choose what I use!
// Instead, I should be able to pick which parts get added, which not,
// where do I plug them in (maybe I put routes under parent route), ... .
// I can't do that if I get only one big Spec.
// I could do it, if I got individual parts: pages, routes, operations, ... .
// But then, if I do get individual parts, how do I make sure I add all the right ones?
// Because if I decide to add some page, but I don't add the query it uses, the page won't work.
// I don't think I should be figuring out those deps here as module user, right stuff should
// be pulled in automatically.
// But those deps are not defined anywhere but in the JS code itself (via imports, e.g. for pages using operations)!
// Which means, we should have a mechanism for defining these deps at spec level.
// One solution might be modeling it via multiple new Spec in the module, where they .use() each one.
// For example each operation is defined via its own new Spec, then each page is also defined so while having .use for all the operations that each one of them uses. And finally each route is also a singleton spec that can use other specs (pages).
// We could say that if you do just `page(...)` instead of `someSpec.page(...)`, it is implicitly created with its own unique Spec.
// Then full stack module exports not one big spec primarily, but many smaller specs, and depending on which ones you use, correct set of others will get pulled in and also used.
// We would have to make sure we don't duplicate piece of spec that are deps multiple times, of course.
// It also allows author of the module to group API into horizontal "layers" where you have to e.g. pull in multiple pages at once, or none. Or multiple operations at once, or none. And similar. Because they used a single new Spec to define multiple pages and exported them via that one spec, not spec per each page.
// Btw should this push us into changing how operations are accessed in React pages/components, and make it so that they are not accessed via imports, but instead injected via context, similar like we inject entities? And that happens based on mechanism above, if they are among the specs used by the page's spec, then they are injected, otherwise not. We were considering this anyway in the past, as a potentially better approach, as it also might make testing nicer (easier mocking).
// Btw then we have two mechanisms for dependencies, if we go for such solution: on operations we have .entities field, while for pages we have Spec.use to link them to operations. I guess it is not the same though, entities are always part of the spec, and here we just choose where to inject them, while operations we might not include into spec if nobody is using them.
spec.use(fileUploadModule);

export default spec;

// TODO: Multiple servers and clients. Client and server setup

// TODO: Explore different approach. where stuff is not always grouped under Spec, but instead is standalone. What if we hade page, query and route as direct imports from @wasp/sdk, and then we did app(page(...)) and similar, where app() registers a given thing onto app. Then we don't need Spec.
