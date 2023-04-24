import { useState, useCallback } from 'react';
import ReactFlow, { Controls, Background, applyNodeChanges, applyEdgeChanges, SmoothStepEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import React from 'react';
import{ addEdge, useNodesState, useEdgesState, MarkerType } from 'reactflow';


const api = 'Your API key';
function Flow() {
  var [message, setMessages] = useNodesState('');

  const [nodes, setNodes] = useState([
    {
      id: 'n1',
      data: { label: <div className="container">
        <input type="text" className='form-control' id='inp'/>
        <button type="submit" className='btn btn-primary m-2' onClick={()=>handleClick()}>Submit</button>
      </div> },
      position: { x: 200, y: 70 },
      type: 'input',
      style: { width: 350, height: 100 },
    },
    {
      id: 'n2',
      data: {label: <label id='node-3'>Enter the question first</label>},
      position: { x: 300, y: 700 },
      type:'custom',
      //style: { width: 350, height: 60 },
    },
    {
      id:'n3',
      data:{label:'Checks if the User is Rude.'},
      position:{x:500, y:300},
      type:'custom',
      style:{width:350, height:60}
    },
    {
      id:'n4',
      data:{label:<div>
        <label>Answer : </label>
        <label id='node-4'></label>
      </div>},
      position:{x:950, y:700},
      type:'custom',
    },
    
  ]);

   const [edges, setEdges] = useEdgesState([
    { id: '1-3', source: 'n1', target: 'n3', label: 'To the custom logic', animated:'true' } ,
    { id:'3-2', source: 'n3', target:'n2', label: 'Is user rude ?', smoothstep: SmoothStepEdge},
    { id:'3-4', source: 'n3', target:'n4', label: 'Answer will appear below', smoothstep: SmoothStepEdge}
   ]);
   const onConnect = useCallback((params) => {
    setEdges((eds) => {
      addEdge(params, eds)
      const { source, target } = params;
      console.log(`New connection created between ${source} and ${target}`);
    }), [setEdges]
  });

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)), 
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  
  async function handleClick() {
    message = document.getElementById('inp').value;
    console.log(message);
    const body = {
      "model": "gpt-3.5-turbo",
      "messages": [{"role": "user", "content": 'dont answer my question just say if it is rude or not, just write yes or no only: '+ message}],
      "temperature": 0.5,
      "max_tokens": 60,
      "top_p": 1,
      "frequency_penalty": 0,
      "presence_penalty": 0
    }
    await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{
        'Authorization':'Bearer ' + api,
        'Content-Type':'application/json'
      },
      body: JSON.stringify(body)
    }).then((data)=>{
      return data.json();
    }).then((data)=>{
      console.log(data);
      if(data.choices[0].message.content.trim()==='No.'||data.choices[0].message.content.trim()==='Yes.'){
        document.getElementById('node-3').innerText = data.choices[0].message.content.trim();
      }
      if(data.choices[0].message.content.trim()==='No.'){
        const body = {
          "model": "gpt-3.5-turbo",
          "messages": [{"role": "user", "content": message}],
          "temperature": 0.5,
          "max_tokens": 60,
          "top_p": 1,
          "frequency_penalty": 0,
          "presence_penalty": 0
        }
        fetch('https://api.openai.com/v1/chat/completions',{
          method:'POST',
          headers:{
            'Authorization':'Bearer ' + api,
            'Content-Type':'application/json'
          },
          body: JSON.stringify(body)
        }).then((data)=>{
          return data.json();
        }).then((data)=>{
          console.log(data);
        document.getElementById('node-4').innerText = data.choices[0].message.content.trim();
        })
      }
      else{
        document.getElementById('node-4').innerText = 'Answer is not Available as user is rude.'
      }
    })
    console.log(edges)
  }
  return (
    <div style={{ height: '100%' }}>
      <ReactFlow
       nodes={nodes}
       edges={edges}
       onNodesChange={onNodesChange}
       onEdgesChange={onEdgesChange}
       onConnect={onConnect}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
export default Flow;
