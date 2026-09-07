import { addDays, sameDay } from './calendar';
export const sampleDate = new Date(2026,8,28);
export const courses = [
 {code:'CSE 373',name:'Data Structures & Algorithms',color:'#5c59c9',short:'Data structures'},
 {code:'MATH 126',name:'Calculus with Analytic Geometry',color:'#207b68',short:'Calculus'},
 {code:'ENGL 131',name:'Composition: Exposition',color:'#ac572c',short:'Composition'},
];
export type Event = {id:string;title:string;course:number;date:Date;hour:number;duration:number;kind:'Class'|'Study'|'Break'|'Work'|'Deadline';done?:boolean;locked?:boolean};
export const events:Event[]=[];
for(let week=0;week<11;week++) {
 for(const day of [0,2,4]) events.push({id:`lecture-${week}-${day}`,title:'Data structures lecture',course:0,date:addDays(sampleDate,week*7+day),hour:9.5,duration:1,kind:'Class'});
 for(const day of [1,3]) events.push({id:`math-${week}-${day}`,title:'Calculus lecture',course:1,date:addDays(sampleDate,week*7+day),hour:10,duration:1.5,kind:'Class'});
 events.push({id:`work-${week}`,title:'Campus café shift',course:-1,date:addDays(sampleDate,week*7+2),hour:13,duration:3,kind:'Work'});
 for(const day of [0,1,3,4]) {
  const course=day%3;
  events.push({id:`study-${week}-${day}`,title:['Review arrays & linked lists','Practice integration','Outline the personal essay'][course],course,date:addDays(sampleDate,week*7+day),hour:day===0?11:14,duration:.75,kind:'Study',done:week===0&&day===0,locked:day===3});
  events.push({id:`break-${week}-${day}`,title:'Take a breather',course:-1,date:addDays(sampleDate,week*7+day),hour:(day===0?11:14)+.75,duration:1/6,kind:'Break'});
 }
 events.push({id:`reading-${week}`,title:'Read & annotate chapter 1',course:2,date:addDays(sampleDate,week*7),hour:14,duration:.75,kind:'Study'});
}
export const deadlines:Event[]=[
 {id:'d1',title:'Problem set 01',course:1,date:addDays(sampleDate,2),hour:23.98,duration:0,kind:'Deadline'},
 {id:'d2',title:'Personal essay draft',course:2,date:addDays(sampleDate,4),hour:23.98,duration:0,kind:'Deadline'},
 {id:'d3',title:'Project 1: Linked lists',course:0,date:addDays(sampleDate,6),hour:23.98,duration:0,kind:'Deadline'},
 {id:'d4',title:'Calculus midterm',course:1,date:addDays(sampleDate,24),hour:10,duration:0,kind:'Deadline'},
 {id:'d5',title:'Final project',course:0,date:addDays(sampleDate,66),hour:23.98,duration:0,kind:'Deadline'},
];
export function eventsOn(date:Date) { return [...events,...deadlines].filter(e=>sameDay(e.date,date)).sort((a,b)=>a.hour-b.hour); }
export function timeLabel(hour:number) { const h=Math.floor(hour),m=Math.round((hour-h)*60);return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'pm':'am'}`; }
