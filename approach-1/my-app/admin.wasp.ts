import { Spec, jsImport } from "@wasp/sdk";

const spec : Spec = new Spec();

// I played with `.routes` grouping routes under common prefix path + setting common options.
// I also played with setting authRequired here although I know it is a page option currently.
spec.routes("/admin", { authRequired: true }, [
  spec.route("/", spec.page({
    component: jsImport("Dashboard.tsx")
  })),
  spec.route("/analytics", spec.page({
    component: jsImport("Analytics.tsx")
  }))
]);

spec.query({
  fn: jsImport("getAnalytics", "queries.ts")
});

export default spec;
