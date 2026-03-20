import { ModuleSpec, Spec, jsImport } from "@wasp/sdk";

const spec = new ModuleSpec("file-upload", {
  extEntityDefs: [ /* entity sub schemas */ ],
  envVarsSchema: { /* some zod schema */ },
  supportedAuth: { /* optional but maybe can be used to limit which auth settings it supports */ },
  init: { /* function called by host module/app when registering module, takes config */ },
});

// TODO: As I write this, it feels like we should also offer spec.component, that they can use in their own page.
// Or maybe our Wasp page is that already really? I mean it is a component, right? Can they use it in their react component?
const fileBrowserPage = spec.page({component: jsImport("FileBrowser.tsx")});
const fileUploadPage = spec.page({component: jsImport("FileUpload.tsx")});

const fileBrowserRoute = spec.route("/browser", fileBrowserPage);
const fileUploadRoute = spec.route("/upload", fileUploadPage);

const uploadFile = spec.action({
  fn: jsImport("uploadFile", "actions.ts"),
  entities: ["File"]
});
const listFiles = spec.query({
  fn: jsImport("listFiles", "queries.ts"),
  entities: ["File"]
});

// Check TODO(FSM) in ../my-app/main.wasp.ts for details on which problems we are hitting here with this design and how we will likely want to change those.
// If we go with that, we might want to make up new imports from @wasp/sdk: { page, route, action, query } where page(...) is really just a helper for (new Spec).page(...), and so on. And then, we would imagine that every Spec has .use() on it, and we would use it to say who depends on whom, e.g. we would do fileUploadRoute.use(fileUploadPage). Hm that would mean repetition for routes since they both need to do that and also specify page as page, that is weird. Oh and is fileUploadPage then a page or spec with page in it? Or both? Whaaat. Maybe this is the wrong way to go about it. Would it help if we didn't have new spec per each page/route/..., but manually made new Specs that group these in some logical fashion? Not sure, doesn't feel it solves much.

export default spec;
