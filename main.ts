import { App, Component } from "o-views";
import { Loader } from "./loader";
import { SvelteRuntime } from "./runtime/svelteRuntime";

// import { EventBroker, Topic } from "./_other/eventBroker";
// import type Web3 from "web3";
// import type Event from "o-types";
// import Process, { LoginProcess } from "./processes/process";
import { Registry } from "./registry";
import { CssGridLayout, SvelteViewLeaf } from "o-views/_other/foo";
// import page from "page";
// import { foo } from "circles-protocol";
import {Views } from "o-views";
// alert(foo);
const appHashNameLookup = {
  "bafzbeidz3eazquyorhjdiosdgbc5j73yz5omnyqrasuz7pertimlmz7e5y": "o-dentity",
  "bafzbeicmtet2ytuo5jlg2jtuh4rbtfvntznwah5mt2kb4xj3zgxt2ol5ma": "o-wallet",
  // "bafzbeiafbjcuy4dxnily3nbt7nab6ebdwyti3z7jgdrblnm4ivqw7hubki": "textile",
  "bafzbeiahddbruy5letgjx6tiijzaednwr3zngtk57u3yyrjcsba7sqjbdq": "o-market"
}
// const hashAppNameLookup = {
//   "odentity": "bafzbeidz3eazquyorhjdiosdgbc5j73yz5omnyqrasuz7pertimlmz7e5y",
//   "wallet": "bafzbeicmtet2ytuo5jlg2jtuh4rbtfvntznwah5mt2kb4xj3zgxt2ol5ma",
//   "textile": "bafzbeiafbjcuy4dxnily3nbt7nab6ebdwyti3z7jgdrblnm4ivqw7hubki",
//   "marketplace": "bafzbeiahddbruy5letgjx6tiijzaednwr3zngtk57u3yyrjcsba7sqjbdq"
// }
// export const navigateTo = function navigateTo(dapp: string, action: string) {
//   // page.base(`/ipns/`);
//   let dappLink = `/ipns/${hashAppNameLookup[dapp.toLowerCase()]}`
//   if (dappLink != window.location.pathname) {
//     window.history.pushState(null, null, dappLink);
//     page.base(dappLink);
//   }
//   page.redirect(action.toLowerCase());
// }

const isLocal = window.location.hostname == "localhost"
  || window.location.hostname == "127.0.0.1"
  || window.location.hostname == "omo.local";

async function xfetch(hash: string, page?: string): Promise<object> {
  let baseUrl = `${window.location.origin}/${isLocal
    ? `${appHashNameLookup[hash]}/`
    : `ipns/${hash}/`}`;
  page = page == "" || page == "/" || !page ? "index" : page;
  const data = await fetch(baseUrl + page + ".json");
  const json = await data.json();

  return json;
}

declare global {
  interface Window {
    // eventBroker: EventBroker;
    // omoEvents: Topic<Event>;
    // trigger: (trigger: any) => void;
    // web3: Web3;
    o: Kernel;
  }
}

class Kernel {
  registry = new Registry()
}
try {
  window.o = new Kernel();

  // Register components, layouts,....
  // Layouts.forEach(l => Registry.register(l.prototype));
  window.o.registry.registerClass(Loader);
  window.o.registry.registerClass(SvelteRuntime);
  window.o.registry.registerClass(CssGridLayout);
  window.o.registry.registerClass(SvelteViewLeaf);
  Views.forEach(v=>window.o.registry.registerClass(v));

//   var sample = CssGridLayout.new({ areas: "main", rowTemplate: "1fr", columnTemplate: "1fr" }).add(SvelteViewLeaf.new(), { area: "main" })
// var foo = sample.toString();
// alert(foo);
// debugger;
  // Views.forEach(v => window.o.registry.register(v));
  //   const eventBroker = new EventBroker();
  //   window.eventBroker = eventBroker;
  //   window.omoEvents = eventBroker.createTopic("omo", "eventLoop");
  //   window.trigger = (trigger: any) => { window.omoEvents.publish(trigger); }
}
catch (e) {
  throw new Error("Software Failure. Guru Meditation: #hash-goes-here ;)");
}




let app;
xfetch(
  "bafzbeidz3eazquyorhjdiosdgbc5j73yz5omnyqrasuz7pertimlmz7e5y",
  "index"
).then((manifest: any) => {
  var loader = new Loader(new SvelteRuntime());
  app = new App({
    target: document.body,
    props: {
      manifest: JSON.stringify(manifest),
      loader: loader
    }
  })
});


export default app;
