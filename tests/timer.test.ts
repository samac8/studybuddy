import test from 'node:test';
import assert from 'node:assert/strict';
import {elapsedSeconds} from '../lib/studyflow/timer.ts';
test('background delay is counted from wall clock',()=>assert.equal(elapsedSeconds(0,1000,121000,2700),120));
test('resuming preserves previously studied time',()=>assert.equal(elapsedSeconds(60,100000,110000,2700),70));
test('timer stops at goal rather than becoming negative',()=>assert.equal(elapsedSeconds(0,0,9999999,2700),2700));
