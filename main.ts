import { Compositor } from "o-views";
import { Kernel } from "./Kernel";

declare global {
  interface Window {
    o: Kernel;
  }
}

let UI;
Kernel.boot().then(o => {
  window.o = o;
  UI = new Compositor({
    target: document.body,
    props: {
      manifest: ""
    }
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



// const appHashNameLookup = {
//   "bafzbeidz3eazquyorhjdiosdgbc5j73yz5omnyqrasuz7pertimlmz7e5y": "o-dentity",
//   "bafzbeicmtet2ytuo5jlg2jtuh4rbtfvntznwah5mt2kb4xj3zgxt2ol5ma": "o-wallet",
//   // "bafzbeiafbjcuy4dxnily3nbt7nab6ebdwyti3z7jgdrblnm4ivqw7hubki": "textile",
//   "bafzbeiahddbruy5letgjx6tiijzaednwr3zngtk57u3yyrjcsba7sqjbdq": "o-market"
// }
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



// async function xfetch(hash: string, page?: string): Promise<object> {
//   let baseUrl = `${window.location.origin}/${isLocal
//     ? `${appHashNameLookup[hash]}/`
//     : `ipns/${hash}/`}`;
//   page = page == "" || page == "/" || !page ? "index" : page;
//   const data = await fetch(baseUrl + page + ".json");
//   const json = await data.json();

//   return json;
// }




