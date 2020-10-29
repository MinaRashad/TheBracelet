let msg = document.getElementById('msg')
let startBtn = document.getElementById('startBtn')
var crntstate = 'start'
var diagonalMovement = true
startBtn.disabled=true
importantPoints={}
tableElement.addEventListener('click',(e)=>{
	addChosenState(e,crntstate)
})

var addChosenState = (e,state)=>{
	colorState = {
		'start':'#0f0',
		'end':'#00f',
		'block':'#666'
	}
	let x = locate(e.target, e.target.parentNode.childNodes)
	let y = locate(e.target.parentNode, e.target.parentNode.parentNode.childNodes)

	if(e.target.tagName == 'TD' && tableData[y][x] == 0)
	{
		e.target.style.backgroundColor = colorState[state]
		tableData[y][x]=state
		importantPoints[state]=[y,x]
		nextState(state)		
	}
	/*
	** table data is just a 2d array,
	** it will help later when analyzing the table
	*/
	// console.table(tableData)
}

var locate = (elem, list)=>{
	for(let i =0; i<list.length; i++)
	{
		if(list[i] == elem)
		{
			return i
		}
	}
	return -1

}
var nextState = (state)=>{
	if (state == 'start')
	{
		crntstate = 'end'
		msg.innerText ='Now, Select your ending point'
	}
	else if(state == 'end')
	{
		crntstate = 'block'
		msg.innerText= 'Finally, put any blocks you want and Start the algorithm'
		startBtn.disabled = false

	}
}

var transformData = (doubleArray)=>{
	var nodeMap = new NodeMap();
	for (let i = 0; i < doubleArray.length; i++) {
		nodeMap.nodes.push([])
		for (let j = 0; j < doubleArray[i].length; j++) {
			let node = new PositionNode()
			node.state = doubleArray[i][j]
			node.walkable = doubleArray[i][j]=='block'?false:true
			node.x=j;
			node.y=i;

			nodeMap.nodes[i].push(node)
			if(doubleArray[i][j] == 'start') nodeMap.start=nodeMap.nodes[i][j]
			else if(doubleArray[i][j] == 'end')nodeMap.end=nodeMap.nodes[i][j]
			
		}
	}
	nodeMap.height=nodeMap.nodes.length
	nodeMap.width=nodeMap.nodes[0].length
	return nodeMap
}

function start()
{
	let nodeMap = transformData(tableData)
	let openList = []
	let closedList = []

	// console.log(nodeMap)
	openList.push(nodeMap.start)
	var animation = setInterval(()=>
	{
		var closest = {f:Infinity}
		// debugger
		//searching for the closest Node
		//First checking if the end is in the ClosedList
		if(closedList.indexOf(nodeMap.end) == -1)
		{
			for (let i = 0; i < openList.length; i++) {
				
				if(openList[i].f < closest.f){
					closest = openList[i]
					colorThe(openList[i],'orange')
				}
				
			}
			crntBlock=closest
			
			colorThe(crntBlock,'#ffa8a8')
			openList.splice(openList.indexOf(crntBlock),1)
			closedList.push(crntBlock)
			let adjacents = nodeMap.getAdjacent(crntBlock)
			for (let i = 0; i < adjacents.length; i++) {
				if(adjacents[i].walkable && closedList.indexOf(adjacents[i])==-1)
				{
					if(openList.indexOf(adjacents[i]) == -1)
					{
						openList.push(adjacents[i])
						adjacents[i].parent = crntBlock;
						//calculating the G value
						
						adjacents[i].g = calculateG(crntBlock)+1
						//calculating the H value
						adjX = adjacents[i].x
						adjY = adjacents[i].y
						endX = nodeMap.end.x
						endY = nodeMap.end.y
						adjacents[i].h = (adjX - endX)**2 + (adjY - endY)**2
						//adding them to get the F value
						adjacents[i].f = adjacents[i].g + adjacents[i].h
						colorThe(adjacents[i],'yellow')

					}else{
						if(adjacents[i].g > calculateG(crntBlock)+1){
							adjacents[i].parent = crntBlock
							colorThe(adjacents[i],'pink')
						}
					}
				}
				
			}
		}
		else{
			//stepping back to show path
			if(crntBlock != null){
			colorThe(crntBlock)
			crntBlock = crntBlock.parent
			}
		}

	},100)
}

function calculateG(crntNode)
{
	// debugger
	numOfSteps = 1
	lastNode=crntBlock
	while(true){
		lastNode = lastNode.parent
		if (lastNode == null)break
		numOfSteps +=1
		if(numOfSteps > (2**32))console.log('Error Calculating the G, infinite Loop');break
	}
	return numOfSteps
}

function PositionNode(){
	this.parent = null;
	this.f = 0;
	this.g = 0;//distance from start
	this.h = 0;//estimated distance to end

	this.x = 0;
	this.y = 0;
	this.walkable = null;
	this.state = ''
}
function NodeMap(){
	this.nodes = []
	this.start=null
	this.end=null
	this.width = 0
	this.height = 0
	this.getAdjacent = (node)=>{
		let x = node.x;
		let y = node.y;
		let adjacentPoses = []
		adjacentPoses.push([x+1,y])
		adjacentPoses.push([x-1,y])
		adjacentPoses.push([x,y-1])
		adjacentPoses.push([x,y+1])
		if(diagonalMovement){
		adjacentPoses.push([x+1,y-1])
		adjacentPoses.push([x-1,y+1])
		adjacentPoses.push([x-1,y-1])
		adjacentPoses.push([x+1,y+1])
		}
		adjacent=[]
		debugger
		for (let i = 0; i < adjacentPoses.length; i++) {
			let adjX = adjacentPoses[i][0]
			let adjY = adjacentPoses[i][1]
			if((adjY >= 0 && adjY < this.height) && (adjX>=0 && adjX < this.width))
			// just making sure nodes are not out of bounds
			// debugger
			adjacent.push(this.nodes[adjY][adjX] )
			
		}
		return adjacent;
	}
}

function colorThe(curntBlock,color='#f00')
{
	y = curntBlock.y
	x = curntBlock.x
	// debugger
	target = tableElement.childNodes[0].childNodes[y].childNodes[x]
	target.style.backgroundColor=color
}