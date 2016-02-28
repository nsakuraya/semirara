/* global describe it */

import {delay} from "./test_helper";
import {assert} from "chai";
import Cache from "../src/lib/cache";


describe("Cache", function(){

  const cache = new Cache({prefix: "test", expire: 1});

  it('should have method "set"', function(){
    assert.isFunction(cache.set);
  });

  it('should have method "get"', function(){
    assert.isFunction(cache.get);
  });

  describe('set then get', function(){

    this.timeout(5000);

    it("should get same value", async function(){
      await cache.set("name", "shokai");
      const res = await cache.get("name");
      assert.equal(res, "shokai");
    });

    it("should expire in 1 sec", async function(){
      await cache.set("name", "shokai");
      await delay(1100); // wait for expire
      const res = await cache.get("name");
      assert.equal(res, null);
    });

  });
});
