# momentum

### TL;DR ES3 can cause serious pain to whomever has to support it: [WEBSITE](https://gioele-antoci.github.io/momentum) 

## What I wanted to do
Build a fast, clean, **react app**. I wanted to do this to showcase my skills with a recent, modern framework but also because it's what makes the most sense. When I read the specifics on my way home I thought this was gonna take me a couple of hours. That was until I read the `es3` requirement.   
Naive me thought I could get away with workarounds. Namely `es5shims` + `es5shams` (more [here](https://github.com/es-shims/es5-shim)) . Or create a react app, take that bundle and pass it through a **transpiler** (Traceur? Babel?).    
I KNEW NOTHING.   
I started going down the rabbit hole, I was 1/2hs into it, the app scaffolding was more or less complete but I couldn't get it to work in IE8 (shims did not work as much as I wanted, this is somewhat expected).    
Ok _think think think_, I said to myself. Maybe Typescript can help me, after all they generate JS all the way down to `es3`. I was wrong again, and time was clicking. It's now 10pm and still haven't started writing actual code.    
Let's look at other frameworks, Angular? No `es3` support. Vue? Nada! Unless you use a very dated, obscure `MVVM` framework there is no help for those damned devs out there that have to support `IE8`.     
Why? Why? [IE8](http://caniuse.com/usage-table) in the browser market share is at **0.38%**.  
Those people who use IE8 don't really deserve it.

## What I ended up doing
I _jQuery-ed_ it. I basically built a very little custom MVVM framework. I still ended up using **Typescript** for the type checks, remember by now it's passed 11pm, I am tired (I have already worked 8hs and done a job interview) so any help I can get from my dev tools is appreciated.    

_...the second can of redbull is now open..._

The app I built is simple, can/should be refactored to be better but it works. I **made it work** in IE8 and it should, with some tweaks, work all the way down to IE6 (but I am not gonna do that, I still have dignity). Everything starts at the `setup` method where we `detach` some elements from the DOM that will be used as templates to generate list of resources. The views (e.g.: anon vs auth) are implemented by a simple class switcher with a `display:none` attached to it. `Ajax` requests are made, I used a 3rd party script to handle cross domain in IE8 (Microsoft in fact used a different standard for ajax). All the other methods are not organized in classes except for those that handle the dialog. To be fair I have written more elegant code in the past but this fulfills the requirements and it was delivered in a little bit over 12hs (of which I spent 5 sleepin').
**Styling** ways I didn't put too much thought into it, I made it usable and functional. Using `material` design would be ideal but `es3`. I centered everything, used percentuage widths and there you have responsiveness without `media-queries`. Clearly this only works for simple data, but that's what I got. _Keep it simple and get shit done_ I kept saying to motivate myself. 


## Improvements
- Give feedback that informs the user the app is loading
- Display who the current authenticated user is
- Show full image on hover (only thumbnails are shown now)
- Css improvs (I am sure I can come out with a way of using material design that gracefully degrade to IE8 )   
  
    
      
_memento audere semper_
