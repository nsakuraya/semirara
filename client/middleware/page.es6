import {io} from "../socket";
import ioreq from "socket.io-request";
import {store} from "../store";
import {diffpatch, clone} from "../../server/src/lib/diffpatch";

export const getPageOnRoute = store => next => async (action) => {
  if(action.type !== "route") return next(action);
  const result = next(action);
  const {title, wiki} = store.getState().page;
  try{
    const page = await ioreq(io).request("getpage", {wiki, title});
    store.dispatch({type: "page", value: page});
  }
  catch(err){
    console.error(err.stack || err);
  }
  return result;
};

export const sendPageDiff = store => next => action => {
  const targetActions = ["insertNewLine", "updateLine"];
  if(targetActions.indexOf(action.type) < 0) return next(action);
  const _lines = clone(store.getState().page.lines);
  const result = next(action);
  const diff = diffpatch.diff(_lines, store.getState().page.lines);
  if(diff){
    const {title, wiki} = store.getState().page;
    io.emit("page:lines:diff", {title, wiki, diff});
  }
  return result;
};

export const unsetEditLineOnRoute = store => next => action => {
  if(action.type !== "route") return next(action);
  const result = next(action);
  store.dispatch({type: "editline", value: null});
  return result;
};

io.once("connect", () => {
  io.on("connect", async () => { // for next connect event
    const state = store.getState();
    const {wiki, title} = state.page;
    try{
      const page = await ioreq(io).request("getpage", {wiki, title});
      store.dispatch({type: "page", value: page});
    }
    catch(err){
      console.error(err.stack || err);
    }
  });
});

io.on("page:lines:diff", (page) => {
  if(!page.diff) return;
  store.dispatch({type: "page:lines:patch", value: page.diff});
});