const screen = document.getElementById("screen");

let expression = "";

document.querySelectorAll("button").forEach(button=>{

button.addEventListener("click",()=>{

const value = button.innerText;

if(value==="AC"){

expression="";

screen.innerText="0";

return;

}

if(value==="⌫"){

expression=expression.slice(0,-1);

screen.innerText=expression||"0";

return;

}

if(value==="="){

try{

let result=eval(expression.replace(/×/g,"*").replace(/÷/g,"/"));

screen.innerText=result;

expression=result.toString();

}

catch{

screen.innerText="Error";

expression="";

}

return;

}

expression+=value;

screen.innerText=expression;

});

});
