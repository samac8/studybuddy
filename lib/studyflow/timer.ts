/** Use wall-clock time so throttled background tabs catch up when revisited. */
export function elapsedSeconds(saved:number,startedAt:number,now:number,total:number){return Math.min(total,Math.max(0,saved+Math.floor((now-startedAt)/1000)));}
