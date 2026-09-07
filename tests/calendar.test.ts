import test from 'node:test';
import assert from 'node:assert/strict';
import {addDays,monday,monthDays,sameDay,shiftDate,foreground,luminance} from '../lib/studyflow/calendar.ts';
test('week begins Monday, including Sundays',()=>{assert.equal(monday(new Date(2026,8,6)).getDate(),31);assert.equal(monday(new Date(2026,8,28)).getDate(),28)});
test('day navigation crosses year boundaries',()=>{assert.ok(sameDay(addDays(new Date(2026,11,31),1),new Date(2027,0,1)))});
test('month navigation never skips February from January 31',()=>{const result=shiftDate(new Date(2026,0,31),'month',1);assert.equal(result.getMonth(),1);assert.equal(result.getDate(),1)});
test('quarter navigation crosses years',()=>{assert.equal(shiftDate(new Date(2026,10,1),'quarter',1).getFullYear(),2027)});
test('month grid has 42 consecutive Monday-first dates',()=>{const grid=monthDays(new Date(2026,8,1));assert.equal(grid.length,42);assert.equal(grid[0].getDay(),1);grid.slice(1).forEach((d,i)=>assert.ok(sameDay(d,addDays(grid[i],1))))});
test('course foregrounds meet WCAG AA contrast for regular text',()=>{for(const bg of ['#5c59c9','#207b68','#ac572c','#ffffff','#000000','#777777']){const l1=luminance(bg),l2=luminance(foreground(bg));assert.ok((Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)>=4.5,bg)}});
