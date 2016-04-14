const debug = require("debug")("semirara:socket:page");

import {getStore} from "../store";
const store = getStore();
import ioreq from "socket.io-request";

export default function pageSocket(io){

  io.on("connect", async () => {
    const state = store.getState();
    const {wiki, title} = state.page;
    const page = await ioreq(io).request("getpage", {wiki, title});
    store.dispatch({type: "page", value: page});
  });

  io.on("page:lines:diff", (page) => {
    debug(page);
    if(!page.diff) return;
    store.dispatch({type: "page:lines:patch", value: page.diff});
  });

  store.subscribe(() => {
    const state = store.getState();
    const {title, wiki, diff} = state.page;
    if(!diff) return;
    io.emit("page:lines:diff", {title, wiki, diff});
  });

}