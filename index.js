var json = {
    "queue": [{
            "qtype": "PRR",
            "run_limit": 2,
            "time_quantum": 5
        },
        {
            "qtype": "RR",
            "run_limit": 3,
            "time_quantum": 10
        },
        {
            "qtype": "PRR",
            "run_limit": 4,
            "time_quantum": 20
        },
        {
            "qtype": "RR",
            "run_limit": 2,
            "time_quantum": 25
        },
        {
            "qtype": "SJF",
            "run_limit": "-",
            "time_quantum": "-"
        }
    ],
    "process": [
        [{
                "priority": 3,
                "time": 50
            },
            {
                "priority": 3,
                "time": 5
            },
            {
                "priority": 2,
                "time": 10
            }
        ],
        [{
                "priority": 3,
                "time": 30
            },
            {
                "priority": 3,
                "time": 5
            },
            {
                "priority": 3,
                "time": 25
            },
            {
                "priority": 2,
                "time": 10
            }
        ],
        [{
                "priority": 1,
                "time": 70
            },
            {
                "priority": 2,
                "time": 40
            },
            {
                "priority": 1,
                "time": 100
            }
        ],
        [{
                "priority": 1,
                "time": 25
            },
            {
                "priority": 2,
                "time": 60
            },
            {
                "priority": 3,
                "time": 35
            }
        ],
        [{
                "priority": 1,
                "time": 25
            },
            {
                "priority": 2,
                "time": 60
            },
            {
                "priority": 3,
                "time": 35
            }
        ]
    ]
} 
var tmpQueue,tempProcess = {}
var log = []//顯示用
var text = ''
const newStateProcess = (tmpData) =>{
    //複製狀態
    let i = 1;
    tmpData.forEach( element=>{
        
        element.forEach((elements, valve) =>{
           
            log[i] = {}
            log[i].ID = i;
            log[i].queue = []
            for(let j = 0; j < tmpQueue.length; j++){
                log[i].queue.push([])
            }
            elements.PID = i++
            elements.deadTime = elements.time
        })
        
    })
}
const sortQueue = ()=>{
    tmpQueue.forEach((element, valve) => {
        if( element.qtype == "PRR")//Shortest-Job-First
            tempProcess[valve].sort( (a, b) => {return a.priority - b.priority})
        // else if(element.qtype == "RR")//round-robin
        //     tempProcess[valve].sort( (a, b) => {return a.PID - b.PID})
        else if(element.qtype == "SJF")//Priority round robin
            tempProcess[valve].sort( (a, b) => {return a.time - b.time})
    });
}
const model= () =>{

}
const main = () =>{
    tmpQueue = [...json.queue]
    tempProcess  = [...json.process]
    newStateProcess([...tempProcess])
    sortQueue();
    var list = 0;
    tmpQueue.forEach( (element, valve) =>{
        tempProcess[valve].forEach( (elements, valves) =>{
            log[elements.PID].queue[valve] = []
        });
        element.run_limit == "-" ? element.run_limit = 999: element.run_limit;
        //簡易無限 ㄏ
        if(element.qtype == "PRR"){
            let arr = [], res ;
            tempProcess[valve].forEach( (elements, valves) =>{
                arr.push(elements.priority)
            }) 
            res = [...new Set(arr)]
            res.forEach(val => {
                let total = 0;
                tempProcess[valve].forEach( (elements, valves) =>{
                    if(elements.priority == val){
                        for(let i = 0; i < element.run_limit; i++){

                            let quantum = element.time_quantum == "-" ? elements.deadTime: element.time_quantum
                            //無限等於自己
                            if(elements.deadTime > 0){
                                // console.log(elements )
                                if(elements.deadTime - quantum <= 0){
                                    //這個tempProcess結束
                                    log[elements.PID].queue[valve].push( elements.deadTime)        
                                    elements.deadTime = 0
                                    log[elements.PID].time = list++ 
                                }
                                else{
                                    // tempProcess的紀錄
                                    elements.deadTime -=quantum
                                    log[elements.PID].queue[valve].push(quantum)  
                                }
                            }
                            //爛中斷
                            tempProcess[valve].forEach( (elements, valves) =>{ 
                                total += elements.deadTime;
                            })
                            if(total <= 0)
                                element.run_limit = i
                        }
                    }
                })
             
            });
           
        }
        else{
            for(let i = 0; i < element.run_limit; i++){
                let total = 0;
                tempProcess[valve].forEach( (elements, valves) =>{
                    
                    let quantum = element.time_quantum == "-" ? elements.deadTime: element.time_quantum
                    //無限等於自己
                    if(elements.deadTime > 0){
                      
                        if(elements.deadTime - quantum <= 0){
                            //這個tempProcess結束
                            log[elements.PID].queue[valve].push( elements.deadTime)        
                            elements.deadTime = 0
                            log[elements.PID].time = list++ 
                        }
                        else{
                            // tempProcess的紀錄
                            elements.deadTime -=quantum
                            log[elements.PID].queue[valve].push(quantum)  
                        }
                    }
                   

                })
                 //爛中斷
                tempProcess[valve].forEach( (elements, valves) =>{ 
                   total += elements.deadTime;
                })
                if(total <= 0)
                    element.run_limit = i
              
            }
        }
        
        tempProcess[valve].forEach( (elements, valves) =>{ 
            if(elements.deadTime > 0){
                 //放到下一個tmpQueue
                if(valve < tmpQueue.length){
                    // if(element.qtype != "SJF"){
                        sortQueue() //先排序?
                    // }
                   
                    // if( element.qtype == "PRR")//Shortest-Job-First
                    // tempProcess[valve].sort( (a, b) => {return a.priority - b.priority})
                    // else if(element.qtype == "RR")//round-robin
                    //     tempProcess[valve].sort( (a, b) => {return a.PID - b.PID})

                    elements.time = elements.deadTime
                    // console.log(elements)
                    tempProcess[valve+1][tempProcess[valve+1].length] = elements
                    
                    if(tmpQueue[valve+1].qtype == "SJF"){
                        tempProcess[valve].splice(valves, 1)
                        tempProcess[valve+1].sort( (a, b) => {return a.time - b.time})
                    }
                     
                }
                
            }
         
        })
        
    })
    log.sort( (a, b) => {return a.time - b.time})
}
const Pad = (str) =>{ 
    str = str.toString(10)
    return	str.padEnd(2)
}

window.onload = () => {
    main()
    log.forEach((element)=>{
        let txt = ''
        element['queue'].forEach((elements, value)=>{
            if(elements.length > 0){
                txt += ` Queue${value+1}: ${[...elements]}`
            }
            
        })
        text += `PID:${Pad(element.ID)} ${txt}\n`
        // console.log(element)
    })
    download('out.txt',text)
    console.log(text)
   
}

const  download = (filename, text) => {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}