import { Router } from "o-views";
import { Kernel } from "./Kernel";

declare global {
  interface Window {
    o: Kernel;
  }
}

let UI;

Kernel.boot().then(o => {
  window.o = o;
  UI = new Router({
    target: document.body,
  })
}).catch(e => {
  console.error(e);
  throw new Error("Software Failure. Guru Meditation: #hash-goes-here ;)");
})
export default UI;
















// xfetch(
//   "bafzbeidz3eazquyorhjdiosdgbc5j73yz5omnyqrasuz7pertimlmz7e5y",
//   "index"
// ).then((manifest: any) => {

// });

// export default app;


