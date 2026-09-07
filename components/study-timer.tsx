'use client';
import {useEffect,useRef,useState} from 'react';
import {Play,Pause,RotateCcw,Timer} from 'lucide-react';
import {elapsedSeconds} from '@/lib/studyflow/timer';
const format=(seconds:number)=>`${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
export function StudyTimer(){
 const [minutes,setMinutes]=useState(45),[elapsed,setElapsed]=useState(0),[running,setRunning]=useState(false);
 const start=useRef(0),saved=useRef(0);
 const total=minutes*60;
 useEffect(()=>{if(!running)return;const tick=()=>{const next=elapsedSeconds(saved.current,start.current,Date.now(),total);setElapsed(next);if(next>=total){saved.current=next;setRunning(false);}};tick();const id=setInterval(tick,250);return()=>clearInterval(id);},[running,total]);
 function toggle(){if(running){saved.current=elapsedSeconds(saved.current,start.current,Date.now(),total);setElapsed(saved.current);setRunning(false);}else{start.current=Date.now();setRunning(true);}}
 function reset(){setRunning(false);saved.current=0;setElapsed(0);}
 return <section className="study-timer" aria-label="Study timer"><div className="timer-intro"><span className="timer-icon"><Timer size={23}/></span><div><h2>Your focus buddy</h2><p>{elapsed>=total?'You did it. Time for a well-earned break!':running?'One small step at a time. You’ve got this.':'Pick a goal. Settle in. Let’s do this.'}</p></div></div><div className="timer-numbers" role="timer" aria-label={`${format(elapsed)} studied, ${format(Math.max(0,total-elapsed))} remaining`}><div><strong>{format(elapsed)}</strong><span>time studied</span></div><span className="timer-divider"/><div><strong>{format(Math.max(0,total-elapsed))}</strong><span>time remaining</span></div></div><div className="timer-actions"><label>Session goal <span><input aria-label="Session goal in minutes" type="number" min="1" max="240" step="1" value={minutes} disabled={running||elapsed>0} onChange={e=>{const n=Number(e.target.value);setMinutes(Math.min(240,Math.max(1,Math.round(n)||1)));}}/> min</span></label><button className="primary" onClick={toggle} disabled={elapsed>=total}>{running?<Pause size={16}/>:<Play size={16}/>} {running?'Pause':elapsed>0?'Resume':'Start'}</button><button className="icon-button" aria-label="Reset study timer" onClick={reset}><RotateCcw size={17}/></button></div><div className="timer-track"><span style={{width:`${elapsed/total*100}%`}}/></div><span className="sr-only" role="status">{elapsed>=total?'Study session complete.':running?'Timer running.':'Timer paused.'}</span></section>
}
