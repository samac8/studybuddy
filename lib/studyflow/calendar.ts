export type View = 'quarter' | 'month' | 'week' | 'day';
export const views: View[] = ['quarter','month','week','day'];
export function addDays(date: Date, amount: number) { const d = new Date(date); d.setDate(d.getDate()+amount); return d; }
export function monday(date: Date) { return addDays(date,-((date.getDay()+6)%7)); }
export function sameDay(a: Date,b: Date) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
export function shiftDate(date:Date,view:View,direction:number) { if(view==='week'||view==='day') return addDays(date,direction*(view==='week'?7:1)); const d=new Date(date);d.setDate(1);d.setMonth(d.getMonth()+direction*(view==='quarter'?3:1));return d; }
export function monthDays(date:Date) { const first=monday(new Date(date.getFullYear(),date.getMonth(),1)); return Array.from({length:42},(_,i)=>addDays(first,i)); }
export function luminance(hex:string) { return hex.slice(1).match(/../g)!.map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0); }
export function foreground(hex:string) { return luminance(hex)>.179?'#000000':'#ffffff'; }
