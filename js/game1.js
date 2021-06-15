// 游戏名字:link-to
// 作者:杜茂非
// 描述:控制画布实现游戏
// 完成时间:2020年4月8日
// 邮箱:2543837953@qq.com
let $=el=>document.querySelector(el);
let $$=el=>document.querySelectorAll(el);
let level='easy'
let coin;
let score;
let sec=100;
let nickname;
let current_tool='';
let red=false;
let images={};
let image_count=0;
let id=0;
let cells=[];
let image_names=[
    'birth_point','moon_house','star_house','sun_house','rebirth_gate','star','star_img',
    'moon','moon_img','sun','sun_img','paver','navigator','eraser'
]
let conf={
    easy:{
        coins:3000,
        buildings:['birth_point','moon_house','star_house','sun_house']
    },
    normal:{
        coins:5000,
        buildings:['birth_point','birth_point','moon_house','star_house','sun_house']
    },
    hard:{
        coins:8000,
        buildings:['birth_point','birth_point','moon_house','star_house','sun_house'
        ,'moon_house','star_house','sun_house']
    },
}
let cols=20;
let rows=10;
let cell_size=60;

let v1=$('#road');
let v2=$('#tools');
let v3=$('#citizens');
let v4=$('#marks');

let c1=v1.getContext('2d');
let c2=v2.getContext('2d');
let c3=v3.getContext('2d');
let c4=v4.getContext('2d');

let cw=cols*cell_size+1*(cols+1);
let ch=rows*cell_size+1*(rows+1);

$('.board').style.width=cw+10+'px';
$('.board').style.height=ch+10+'px';
$$('canvas').forEach(c=>{
    c.width=cw;
    c.height=ch;
})
$('.tool-btn').addEventListener('click',e=>{
    $('.tool-info').style.display='flex'
    $('.set-info').style.display='none'
})
$('#setting').addEventListener('click',e=>{
    $('.tool-info').style.display='none'
    $('.set-info').style.display='flex'
})
$$('.tool img').forEach(e=>{
    e.addEventListener('click',i=>{
        $$('.tool img').forEach(e=>{
            e.classList.remove('down');
        })
        i.target.classList.add('down');
        current_tool=i.target.id;
    })
})
$('.new-game-btn').addEventListener('click',e=>{
    $('.new-game-form').style.display='block';
})
$('#accept-btn').addEventListener('click',e=>{
  nickname=$('#nickname').value.trim();
  show('.level')
})
$('#level').addEventListener('change',e=>{
    level=$('#level').value;
    while (true){
        if (red){
            init_game();
            break
        }
    }
    show('.game-board');
})
function displayInfo(){
    $('.score').innerText=score
    $('.coin').innerText=coin
    $('.nickname').innerText=nickname
    $('.levels').innerText=level
}
function setData(keep){
    if (!keep){
        coin=conf[level].coins;
        score=0
    }else{
        if ($('.levels').innerText!==level){
            coin+=conf[level].coins;
        }
    }
    displayInfo();
    $('.timer').innerText=100
}
function drawGird(){
    c1.setLineDash([10,2]);
    c1.strokeStyle="#ccc";
    for (let x=0;x<cw;x+=cell_size+1){
        c1.moveTo(x,0);
        c1.lineTo(x,ch);
        c1.stroke();
    }
    for (let y=0;y<ch;y+=cell_size+1){
        c1.moveTo(0,y);
        c1.lineTo(cw,y);
        c1.stroke();
    }
}
function show(name){
    $$('.page').forEach(e=>{
        e.style.display='none'
    })
    $(name).style.display='flex'
}
function clearCanvasAll(){
    $$('canvas').forEach(c=>{
        c.getContext('2d').clearRect(0,0,c.width,c.height);
    })
}
function clearCell(ctx,cell){
    ctx.clearRect(cell.x,cell.y,cell.w,cell.h);
}
function randInt(min,max){
    return min+Math.floor(Math.random()*(max-min+1));//floor向下取整
}
function getCellByRC(r,c){
    return cells.find(cell=>cell.c===c&&cell.r===r);
}
function getCellById(id){
    return cells.find(cell=>cell.id===id);
}
function setCells(){
    cells=[]
    for (let y=1,r=0;y<ch;y+=cell_size+1,r++){
        for (let x=1,c=0;x<cw;x+=cell_size+1,c++){
            id++;
            let cell=new Cell(x,y,c,r,cell_size,cell_size,id);
            cell.clear();
            cells.push(cell);
        }
    }
}
function clearCanvas(canvas){
    canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
}
function setScore(val){
    score+=val;
    $('.score').innerText=score;
}
function setCoin(val){
    coin+=val;
    if (coin<0){
        coin=0;
    }
    $('.coin').innerText=coin;
}
function init_game(keep=false){
    clearCanvasAll();
    drawGird();
    setCells();
    $('#rebirth_gate').parentElement.style.display=level==="easy"?'none':'block';
    setData(keep)
    conf[level].buildings.forEach(name=>{
        let cell;
        while (true){
             cell=cells[randInt(0,(rows*cols)-1)];
             if (cell&&cell.isB) continue;
             if (cell.top&&cell.top.isB)continue;
             if (cell.bottom&&cell.bottom.isB)continue;
             if (cell.r===rows-1) continue;
             break
        }
        if (name==='birth_point'){
            c1.drawImage(images[name],cell.x,cell.y+cell.h*0.2,cell.w,cell.h*0.8);
            let items=['moon','star','sun'];
            for (let i=0;i<5;i++){
                let item=items[randInt(0,items.length-1)];
                let citizen=new Citizen(cell.id,item);
                cell.citizens.push(citizen);
                cell.citizens_bk=[...cell.citizens];
                c1.drawImage(images[item+'_img'],cell.x+(i*12),cell.y,12,cell.h*0.2);
            }
        }else {
            cell.setImage(c1,images[name]);
        }
        cell.building=name;
    })
}
for (let image_name of image_names){
    let img=new Image()
    img.onload=e=>{
        image_count++;
        images[image_name]=img
        if (image_names.length===image_count){
            red=true;
        }
    }
    img.src='img/'+image_name+'.png';
}
class  Cell{
    constructor(x,y,c,r,w,h,id) {
        this.x=x
        this.y=y
        this.c=c
        this.r=r
        this.w=w
        this.h=h
        this.id=id
        this.tools=[]
        this.building=''
        this.citizens=[]
        this.marked=false
        this.ok=false
    }
    clear(){
        c1.clearRect(this.x,this.y,this.w,this.h);
        this.tools=[]
        this.building=''
        this.marked=false
    }
    get isB(){
        return this.building!=='';
    }
    get top(){
        return getCellByRC(this.r-1,this.c);
    }
    get bottom(){
        return getCellByRC(this.r+1,this.c);
    }
    get left(){
        return getCellByRC(this.r,this.c-1);
    }
    get right(){
        return getCellByRC(this.r,this.c+1);
    }
    get dirs(){
        return [this.top,this.bottom,this.left,this.right];
    }
    setImage(ctx,img){
        ctx.drawImage(img,this.x,this.y,this.w,this.h);
    }
    has(x,y){
        return x>=this.x&&x<=this.x+this.w&&y>=this.y&&y<=this.y+this.w;
    }
    mark(){
        c1.fillStyle="#ccc";
        c1.fillRect(this.x,this.y,this.w,this.h);
        this.marked=true;
    }
    get isNavigator(){
        return this.tools.indexOf('navigator')!==-1;
    }
    get isRebirthGate(){
        return this.tools.indexOf('rebirth_gate')!==-1;
    }
    get isBirthPoint(){
        return this.building==='birth_point';
    }
    get isRoad(){
        return this.tools.indexOf('paver')!==-1;
    }
    get isCross(){
        if (!this.isRoad||this.isNavigator) return false;
        return this.dirs.filter(d=>(d&&d.isRoad)).length>2;
    }
    get isEnd(){
        if (!this.isRoad||this.isRebirthGate||cells.filter(c=>c.isRebirthGate).length!==0||this.top&&this.top.isB) return false;
        return this.dirs.filter(d=>(d&&d.isRoad)).length===1;
    }
    get isHouse(){
        return this.building.indexOf('house')!==-1;
    }
    drawHeader(){
        c1.clearRect(this.x,this.y,this.w,this.h*0.2);
        this.citizens.forEach((c,i)=>{
            c1.drawImage(images[c.type+'_img'],this.x+(i*12),this.y,12,this.h*0.2);
        })
    }
    getShortestPath(name){
        let path=[]
        let shortest=[]
        function getPath(c1,c2){
            if (!c1.isRoad) return;
            path.push(c1);
            c1.ok=true;
            if (c1.r===c2.r+1&&c1.c===c2.c){
                if (shortest.length===0||path.length<shortest.length){
                    shortest=[...path]
                    path=[];
                }
            }
            c1.dirs.forEach(d=>{
                if (d&&d.isRoad&&!d.ok){
                    getPath(d,c2);
                }
            })
            path.pop();
            c1.ok=false;
        }

        cells.filter(c=>c.building===name).forEach(c=>{
            getPath(this,c);
        })
        return shortest;
    }
}

class  Citizen{
    constructor(cell_id,type) {
        this.ori_cell_id=this.cell_id=cell_id;
        this.type=type
        this.reset()
    }
    reset(){
        this.cell=this.oriCell;
        this.arrived=false;
        this.rebirthed=false;
        this.next_cell_id=null;
        this.prev_cell_id=null;
        this.x=this.cell.x
        this.y=this.cell.y
        this.w=this.cell.w
        this.h=this.cell.h
    }
    get cell(){
        return getCellById(this.cell_id);
    }
    set cell(cell){
        if (cell){
            this.cell_id=cell.id
            this.x=cell.x
            this.y=cell.y
        }else {
            this.cell_id=null;
        }
    }
    get oriCell(){
        return getCellById(this.ori_cell_id);
    }
    get nextCell(){
        return getCellById(this.next_cell_id);
    }
    get prevCell(){
        return getCellById(this.prev_cell_id);
    }
    set oriCell(cell){
        this.ori_cell_id=cell?cell.id:null
    }
    set nextCell(cell){
        this.next_cell_id=cell?cell.id:null
    }
    set prevCell(cell){
        this.prev_cell_id=cell?cell.id:null
    }
    move(){
        if (this.oriCell===this.cell&&this.oriCell.bottom&&this.oriCell.bottom.isRoad){
            this.nextCell=this.oriCell.bottom;
        }
        clearCell(c3,this);
        if (!this.nextCell)return;
        let dx=this.x-this.nextCell.x;
        let dy=this.y-this.nextCell.y;
        if (dx===0&&dy===0){
            this.prevCell=this.cell
            this.cell=this.nextCell
            if (this.cell.isHouse){
                if (this.cell.building!==this.type+'_house'){
                    if (cells.filter(c=>c.isRebirthGate).length>0&&!this.rebirthed){
                        let reb=cells.find(c=>c.isRebirthGate);
                        if (reb){
                            this.cell=reb;
                            this.nextCell=this.findNextCell()
                            this.rebirthed=true;
                        }
                    }else {
                        clearCell(c3,this)
                        this.arrived=true
                        setScore(-100);
                    }
                }else {
                    clearCell(c3,this)
                    this.arrived=true;
                    setScore(100)
                    setCoin(100)
                }
            }else {
                this.nextCell=this.findNextCell()
            }
        }else if (dx===0){
            this.y+=dy>0?-1:+1;
        }else if (dy===0){
            this.x+=dx>0?-1:+1;
        }
        if (!this.arrived) c3.drawImage(images[this.type],this.x,this.y,this.w,this.h);
    }
    findNextCell(){
        if (this.cell.top&&this.cell.top.isB&&!this.cell.top.isBirthPoint) return this.cell.top;
        if (this.cell.isNavigator){
            let path=this.cell.getShortestPath(this.type+'_house');
            if (path.length===1) return path[0]
            else if (path.length>1) return path[1]
            else return this.getRandDir();
        }else {
            return  this.getRandDir()
        }
    }
    getRandDir(){
        let dir=[];
        this.cell.dirs.forEach(d=>{
            if (d&&d.isRoad&&!d.isRebirthGate){
                dir.push(d);
            }
        })
        if (dir.length===1) {
            return dir[0];
        }else if (dir.length>1){
            dir=dir.filter(d=>d!==this.prevCell)
            return dir[randInt(0,dir.length-1)];
        }
    }
}
function game_over(val){
    if (val==='lose'){
        $('.lose').style.display='flex'
    }else {
        $('.win').style.display='flex'
        $('.next-level').disabled=level==='hard'?true:false;
        let data=JSON.parse(localStorage.getItem('game_data')||'[]');
        data.push({level,nickname,score,sec});
        localStorage.setItem('game_data',JSON.stringify(data));
    }
    $('.box').style.display='flex'
    $('.win .coin-val').innerText=coin;
    $('.lose .coin-val').innerText=coin;
    $('.win .score-val').innerText=score;
    $('.lose .score-val').innerText=score;
}
$('.play-again').addEventListener('click',e=>{
    init_game();
    $('.box').style.display='none';
})
$('.next-level').addEventListener('click',e=>{
   switch (level){
       case "easy":
           level='normal'
           break
       case "normal":
           level='hard'
           break;
   }
   init_game(true);
   $('.box').style.display='none'
    $('.launch').click();
})
$('.end-game').addEventListener('click',e=>{
    getRanking();
})
function getRanking(){
    let data=JSON.parse(localStorage.getItem('game_data')||'[]')
    let txt=``;
    data.sort((a,b)=>{
        if (a.score>b.score) return -1;
        if (a.score>b.score) return 1;
        if (a.score===b.score){
            if (a.sec>b.sec) return -1;
            if (a.sec<b.sec) return 1;
        }
    })
    data.forEach((d,idx)=>{
        txt+=`
        <tr>
            <td>${idx+1}</td>
            <td>${d.nickname}</td>
            <td>${d.score}</td>
            <td>${d.sec}</td>
        </tr>
    `
    })
    $('#rank-rows').innerHTML=txt;
    show('.rank')
}


let intv=null;
let ms=0;
function start(){
    let citizens=[];
    let bps=cells.filter(c=>c.isBirthPoint)
    for (let bp of bps){
        if (bp.citizens.length>0){
            if (bp.bottom&&bp.bottom.isRoad){
                let c=bp.citizens.shift();
                if (c){
                    citizens.push(c);
                    bp.drawHeader();
                }
            }
        }
    }

    intv=setInterval(e=>{
        ms+=5;
        if (ms===1000){
            sec-=1;
            $('.timer').innerText=sec;
            if (sec===0){
                clearInterval(intv);
                if (cells.filter(c=>c.isBirthPoint&&c.citizens.length>0).length>0&&citizens.length>0){
                    game_over('lose')
                }else {
                    if (score>0){
                        game_over('win')
                    }else {
                        game_over('lose')
                    }
                }
            }
            ms=0;
        }
        if (cells.filter(c=>c.isBirthPoint&&c.citizens.length>0).length===0&&citizens.length===0){
            clearInterval(intv);
            if (score>0){
                game_over('win')
            }else {
                game_over('lose')
            }
        }
        citizens.forEach(c=>{
            if (!c.arrived){
                c.move();
            }else {
                citizens.splice(citizens.indexOf(c),1);
               let cc=c.oriCell.citizens.shift();
               if (cc){
                   citizens.push(cc)
                   c.oriCell.drawHeader();
               }
            }
        })
    },5);
}
$('.launch').addEventListener('click',(e)=>{
        if (!intv){
            start();
            $('.launch').innerText='Build'
            $('.tool-btn').disabled=true;
            $('#setting').disabled=true;
            $('.tool-info').style.display='none'
            $('.set-info').style.display='none'
        }else {
            clearInterval(intv);
            intv=null;
            $('.launch').innerText='Launch'
            $('.tool-btn').disabled=false;
            $('#setting').disabled=false;
            sec=100;
            setData(true);
            citizens=[]
            cells.filter(c=>c.isBirthPoint).forEach(pb=>{
                pb.citizens=[...pb.citizens_bk];
                pb.citizens.forEach(c=>{
                    c.reset();
                })
                pb.drawHeader();
            })
            clearCanvas(v3);
        }
})
let mouseMove=false;
let mouseDown=false;
let can_paver=true;

document.addEventListener('mousedown',e=>{
    if (e.target.nodeName!=='CANVAS') return;
    mouseDown=true
    mouseMove=false;
})
document.addEventListener('mousemove',e=>{
    if (e.target.nodeName!=='CANVAS') return;
    mouseMove=true;
    let cell=cells.find(c=>c.has(e.offsetX,e.offsetY));
    if (mouseDown&&current_tool==='paver'){
        if (cell&&cell.isB){
            can_paver=false;
        }
        if (cell&&!cell.isB&&!cell.isRoad){
            cell.mark();
        }
    }else {
        clearCanvas(v4);
        switch (current_tool){
            case "rebirth_gate":
            if(cell&&cell.isEnd){
                cell.setImage(c4,images[current_tool])
            }
            break;
            case "navigator":
                if(cell&&cell.isCross){
                    cell.setImage(c4,images[current_tool])
                }
                break;
            case "eraser":
                if (cell&&cell.tools.length>0){
                    cell.setImage(c4,images[current_tool]);
                }
        }
    }

})
document.addEventListener('mouseup',e=>{
    if (e.target.nodeName!=='CANVAS'){
        can_paver=false;
    }
    let cell=cells.find(c=>c.has(e.offsetX,e.offsetY));
    if (mouseMove){
        if (can_paver){
            if (coin>=50){
                cells.filter(c=>c.marked).forEach(c=>{
                    c.clear()
                    c.setImage(c1,images['paver'])
                    c.tools.push('paver');
                    setCoin(-50);
                });
            }else if (coin<50){
                alert("Coin insufficient");
                cells.filter(c=>c.marked).forEach(c=>c.clear());
            }
        }else {
            cells.filter(c=>c.marked).forEach(c=>c.clear());
        }
    }else {
        if (current_tool==='navigator'&&cell&&cell.isCross){
            if (coin>=500){
                cell.setImage(c2,images[current_tool]);
                cell.tools.push('navigator');
                setCoin(-500)
            }else if (coin<500){
                alert("Coin insufficient")
            }
        }
        if (current_tool==='rebirth_gate'&&cell&&cell.isEnd){
            if (coin>=1000){
                cell.setImage(c2,images[current_tool]);
                cell.tools.push('rebirth_gate');
                setCoin(-1000)
            }else if (coin<1000){
                alert("Coin insufficient")
            }
        }
        if (current_tool==='eraser'&&cell){
            let tool='';
            if (cell.tools.length>1){
                tool=cell.tools.pop();
                clearCell(c2,cell)
            }
            else if(cell.tools.length===1){
                tool=cell.tools.pop();
                clearCell(c1,cell)
            }
            if (tool==='paver'){
                setCoin(50*0.8);
            }else if(tool==='navigator'){
                setCoin(500*0.8)
            }else if(tool==='rebirth_gate'){
                setCoin(1000*0.8)
            }
        }
    }
    mouseMove=false
    mouseDown=false
    can_paver=true
})
function loadGame(){
    let input=document.createElement('input');
    input.type='file';
    input.addEventListener('change',e=>{
        let file=input.files[0];
        let rea=new FileReader();
        rea.readAsText(file);
        rea.onload=e=>{
            let save_data;
            try {
                save_data=JSON.parse(rea.result);
            }catch (e){
                alert('Error')
            }
            coin=save_data.coin;
            score=save_data.score;
            nickname=save_data.nickname;
            level=save_data.level;
            displayInfo();
            clearCanvasAll()
            drawGird();
            cells=[]
            save_data.cells.forEach(c=>{
                c1.clearRect(c.x,c.y,c.w,c.h);
            })
            save_data.cells.forEach(cell=>{
                let c=new Cell();
                cells.push(Object.assign(c,cell));
            })
            cells.forEach(c=>{
                if (c.isB){
                    if (c.isBirthPoint){
                        c1.drawImage(images[c.building],c.x,c.y+c.h*0.2,c.w,c.h*0.8);
                    }else {
                        c.setImage(c1,images[c.building]);
                    }
                }
                if (c.tools.length>=1){
                    c.setImage(c1,images['paver'])
                    if (c.isNavigator){
                        c.setImage(c2,images['navigator'])
                    }else if (c.isRebirthGate){
                        c.setImage(c2,images['rebirth_gate'])
                    }
                }
            })
            cells.filter(c=>c.citizens.length>0).forEach(bp=>{
                let cts=[];
                bp.citizens.forEach(c=>{
                    let ct=new Citizen(c.cell_id,c.type);
                    cts.push(ct);
                })
                bp.citizens=[...cts];
                bp.citizens_bk=[...cts];
                bp.drawHeader();
            })
            show('.game-board');
        }
    })
    input.style.display='none'
    input.click()
    document.body.appendChild(input);
}
$('.save').addEventListener('click',e=>{
    let a=document.createElement('a');
    let data=JSON.stringify({cells,level,nickname,coin,score})
    a.href='data:text/plain;charset=utf-8,'+encodeURIComponent(data);
    a.download='saved-game.json';
    a.style.display='none';
    a.click();
    document.body.appendChild(a);
})
$('.load').addEventListener('click',e=>{
    loadGame();
})
$('.load-game-btn').addEventListener('click',e=>{
    loadGame();
})
setTimeout(e=>{
    init_game();
},500)
