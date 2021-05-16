/* >>>>>>>>>>>>>>> Page Builder */
function _pageBuilder(){
    this.attachAttr = function(obj,attr){
        for (var a in attr) {
                if (typeof attr[a] != 'object') {
                    obj[a] = attr[a];
                }
                else {
                    this.attachAttr(obj[a],attr[a]);
                }
            }
    }

    this.newElem = function (tag, attribute) {
        try {
            var ne = document.createElement(tag.toString());
            this.attachAttr(ne,attribute);
        }
        catch (e) {
            return null;
        }
        return ne;
    }

    this.newElemTree = function (tree) {
        //tree = {'tag',{attr},'innerHTML',[son]}
        try {
            var root = this.newElem(tree.tag, (tree.attr) ? (tree.attr) : {});
            //root = document.createElement('p');
            if (tree.innerHTML) root.innerHTML = tree.innerHTML;
            for (var i in tree.son) {
                root.appendChild(this.newElemTree(tree.son[i]));
            }
        }
        catch (e) {
            console.log(e);
            console.log(tree);
            //return null;
            return document.createElement('br');
        }
        return root;
    }
}

pageBuilder = new _pageBuilder();

/* <<<<<<<<<<<<<<< Page Builder */


function readWorkbookFromRemoteFile(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open('get', url, true);
	xhr.responseType = 'arraybuffer';
	xhr.onload = function (e) {
		if (xhr.status == 200) {
			var data = new Uint8Array(xhr.response)
			var workbook = XLSX.read(data, { type: 'array' });
			if (callback) callback(workbook);
		}
	};
	xhr.send();
}
// 加载本地excel文件
function selectFile() {
	document.getElementById('file').click();
	// console.log('selectFile() after click')
	// 调用文件选择控件，之后交由onchange处理
}

function readWorkbookFromLocalFile(file, callback) {
	var reader = new FileReader();
	reader.onload = function (e) {
		var data = e.target.result;
		var workbook = XLSX.read(data, { type: 'binary' });
		if (callback) callback(workbook);
	};
	reader.readAsBinaryString(file);
}

// Input: XLSX.workbook
// Output: None
// Behavior: call modifyTableWithCSV(csv)
function readWorkbook(workbook) {
	var sheetNames = workbook.SheetNames; // 工作表名称集合
	var worksheet = workbook.Sheets[sheetNames[0]]; // 这里我们只读取第一张sheet
	var csv = XLSX.utils.sheet_to_csv(worksheet);
	// document.getElementById('result').innerHTML = csv2table(csv);
	modifyTableWithCSV(csv);
}


function readCSVFromLocalFile(file, callback) {
	var reader = new FileReader();
	reader.onload = function (e) {
		var csv = e.target.result;
		if (callback) callback(csv);
	};
	reader.readAsText(file);
}


function readCSV(csv) {
	modifyTableWithCSV(csv);
}

// 使用csv更新BGMtable
function modifyTableWithCSV(csv) {
	var BGMList = getBGMListFromCSV(csv)
	modifyTableWithBGMList(BGMList)
}

// 根据CSV字符串获取曲单结构体BGMList
function getBGMListFromCSV(csv) {
	// CSV = csv
	var rows = csv.split('\n');
	// var content = '';
	if (rows[rows.length-1] == "") {
		rows.pop();
	}
	var BGMList = rows.slice(1).map( function (row) {
		cols = row.split(',');
		return {
			miscId : cols[0],
			miscName : cols[1],
			titleZh : cols[2],
			titleJp : cols[3],
			character : cols[4],
			cloudId : cols[5],
		}
	});
	return BGMList;
}

function getTrNodeFromDict(BGMDict, index = null) {
	//tree = {'tag',{attr},'innerHTML',[son]}
	tree = {
		tag : "tr",
		attr : {
			id : "BGMTable.row." + BGMDict.cloudId,
		},
		son : [
			{
				tag : "td", 
				attr : {id : "BGMTable.row." + BGMDict.cloudId + ".index", className : "BGMTableCellIndex", },
				innerHTML : index?index:"",
			}, 
			{
				tag : "td", 
				attr : {id : "BGMTable.row." + BGMDict.cloudId + ".miscId", className : "BGMTableCellMiscId", },
				innerHTML : BGMDict.miscId,
			}, 
			{
				tag : "td", 
				attr : {id : "BGMTable.row." + BGMDict.cloudId + ".miscName", className : "BGMTableCellMiscName", },
				innerHTML : BGMDict.miscName,
			}, 
			{
				tag : "td", 
				attr : {id : "BGMTable.row." + BGMDict.cloudId + ".titleZh", className : "BGMTableCellTitleZh", },
				innerHTML : BGMDict.titleZh,
			}, 
			{
				tag : "td", 
				attr : {id : "BGMTable.row." + BGMDict.cloudId + ".titleJp", className : "BGMTableCellTitleJp", },
				innerHTML : BGMDict.titleJp,
			}, 
			{
				tag : "td", 
				attr : {id : "BGMTable.row." + BGMDict.cloudId + ".character", className : "BGMTableCellCharacter", },
				innerHTML : BGMDict.character,
			}, 
			{
				tag : "td", 
				attr : {id : "BGMTable.row." + BGMDict.cloudId + ".cloudId", className : "BGMTableCellCloudId", },
				innerHTML : BGMDict.cloudId,
			}, 
			{
				tag : "td", 
				attr : {id : "BGMTable.row." + BGMDict.cloudId + ".choose", className : "BGMTableCellChoose", },
				son : [
					{
						tag : "input",
						attr : {
							type : "checkbox",
							className : "checkbox",
							id : "BGMTable.row." + BGMDict.cloudId + ".choose.checkbox"
						},
					},
				],
			}, 
			
		],
	};
	return pageBuilder.newElemTree(tree);
}

function getListenerFunctionWithThis(func, t) {
	return function() {
		func(t);
	};
}

// 根据BGMList更新BGMtable
function modifyTableWithBGMList(BGMList) {
	var listTableRows = []
	var titleDict = {
		miscId : "作品编号",
		miscName : "作品名称",
		titleZh : "BGM中文标题",
		titleJp : "BGM日文标题",
		character : "角色",
		cloudId : "网易云id",
	}
	rowHead = getTrNodeFromDict(titleDict, index = null)
	rowHead.lastElementChild.lastElementChild.addEventListener("click", getListenerFunctionWithThis(checkAll, rowHead.lastElementChild.lastElementChild))
	listTableRows.push(rowHead)
	BGMList.forEach(function(BGMDict, index) {
		listTableRows.push(getTrNodeFromDict(BGMDict, index = index+1))
	})
	// return listTableRows
	while (document.getElementById("BGMtable").childElementCount) {
		document.getElementById("BGMtable").firstChild.remove()
	}
	listTableRows.forEach(function(row) {
		document.getElementById("BGMtable").appendChild(row)
	})
}

// 加载本地卡牌列表
function loadLocalCardfile() {
	document.getElementById('cardfile').click();
}

const shuffle = ([...arr]) => {
	let m = arr.length;
	while (m) {
		const i = Math.floor(Math.random() * m--);
		[arr[m], arr[i]] = [arr[i], arr[m]];
	}
	return arr;
};

function loadCards(cards) {
	var table = document.getElementById('BGMtable')
	var rows = table.rows
	var checkbox = document.getElementsByClassName('checkbox')
	var order = Array.from(Array(rows.length - 1), (v, k) => k + 1);
	order = shuffle(order)
	order.forEach(function (j) {
		var cellname = rows[j].cells[5].innerHTML
		for (k = 0; k < cards.length; ++k) {
			if (cellname.trim().replace(/&amp;/g,"&") == cards[k].trim()) {
				checkbox[j].checked = true
				cards.splice(k, 1)
				break
			}
		}
	})
}

// 显示选择
function chooseBGMs() {
	var checkbox = document.getElementsByClassName('checkbox');
	var table = document.getElementById('BGMtable');
	var selected = ''
	for (i = 1; i < checkbox.length; ++i) {
		if (checkbox[i].checked) {
			table.rows[i].style.display = ''
		} else {
			table.rows[i].style.display = 'none'
		}
	}
}
// 全部显示
function displayAll() {
	var table = document.getElementById('BGMtable');
	for (i = 1; i < table.rows.length; ++i) {
		table.rows[i].style.display = ''
	}
}

// 全选按钮
function checkAll(nodeCheckbox = null) {
	var e = nodeCheckbox?nodeCheckbox:document.getElementById('checkAll');
	var checkboxs = document.getElementsByClassName('checkbox');
	var rows = document.getElementById('BGMtable').rows
	for (i = 1; i < checkboxs.length; ++i) {
		if (rows[i].style.display != 'none') { // 只操作当前筛选项
			checkboxs[i].checked = e.checked
		}
	}
}

// 搜索筛选
function filter() {
	var name = document.getElementById('filter').value
	var table = document.getElementById('BGMtable')
	var rows = table.rows
	for (i = 1; i < rows.length; ++i) {
		var cellname = rows[i].cells[5].innerHTML
		if (cellname.search(name) < 0) {
			rows[i].style.display = 'none'
		} else {
			rows[i].style.display = ''
		}
	}
	var e = document.getElementById('checkAll')
	e.checked = false
}

// 随机播放
//		margin: 保护时间，防止选到开头或结尾的位置
function randomSelect(isAutoPlay = false, margin = 20) {
	var audio = document.getElementById('player')
	loadAudio(audio, function () {
		var duration = audio.duration
		audio.currentTime = Math.min(Math.max((Math.random() * (duration - margin * 2)) + margin, 0), duration)
		if (isAutoPlay) {
			audio.play()
		}
	})
}

function hideAnswer() {
	document.getElementById("answerBlock").classList.add("hiddenAnswer");
}

function showAnswer() {
	document.getElementById("answerBlock").classList.remove("hiddenAnswer");
}

function loadAudio(audio, callback) {
	// 获取当前有效候选曲目列表
	var table = document.getElementById('BGMtable')
	var checkbox = document.getElementsByClassName('checkbox')
	var rows = table.rows
	var bgms = []
	for (i = 1; i < rows.length; ++i) {
		if (checkbox[i].checked && rows[i].style.display != 'none') {
			bgms.push(i)
		}
	}
	
	// 从列表里随机选择一首
	var idx = bgms[Math.floor(Math.random() * bgms.length)]
	// 从列表里移出该曲目
	rows[idx].style.display = 'none'
	
	// 更新答案区域
	var game_no = document.getElementById('作品编号')
	var game_name = document.getElementById('作品名称')
	var bgm_jpn_title = document.getElementById('BGM中文标题')
	var bgm_chn_title = document.getElementById('BGM日文标题')
	var girl_name = document.getElementById('角色')
	
	hideAnswer()

	game_no.innerHTML = rows[idx].cells[1].innerHTML
	game_name.innerHTML = rows[idx].cells[2].innerHTML
	bgm_jpn_title.innerHTML = rows[idx].cells[3].innerHTML
	bgm_chn_title.innerHTML = rows[idx].cells[4].innerHTML
	girl_name.innerHTML = rows[idx].cells[5].innerHTML
	
	// 设置播放控件的媒体地址
	// dirname = '[' + rows[idx].cells[1].innerHTML + '] ' + rows[idx].cells[2].innerHTML
	// audio.src = 'mp3\\' + dirname + '\\' + rows[idx].cells[4].innerHTML + '.mp3' // 本地播放
	audio.src = 'http://music.163.com/song/media/outer/url?id=' + rows[idx].cells[6].innerHTML
	audio.load()
	audio.onloadedmetadata = callback
}

// 显示答案
function answer() {
	showAnswer()
}

// 随机添加10首
function addRandom() {
	var checkboxs = document.getElementsByClassName('checkbox');
	var rows = document.getElementById('BGMtable').rows
	var order = Array.from(Array(rows.length - 1), (v, k) => k + 1);
	order = shuffle(order)
	count = 0
	for (i = 0; i < order.length; ++i) {
		if (!checkboxs[order[i]].checked) {
			checkboxs[order[i]].checked = true
			count++
			if (count >= 10) {
				break
			}
		}
	}
}

// 下载远程卡牌列表
function downloadCardfile() {
	var selected = document.getElementById('cardfiles')
	var a = document.getElementById('forDownload')
	a.href = 'https://hieda-no-tzz.github.io/TouHou.github.io/' + selected.value + '.txt'
	a.title = selected.value + '.txt'
	a.click()
}

// 加载远程卡牌列表
function loadRemoteCardfile() {
	var selected = document.getElementById('cardfiles')
	var url = 'https://hieda-no-tzz.github.io/TouHou.github.io/' + selected.value + '.txt'
	var xhr = new XMLHttpRequest();
	xhr.open('get', url, true);
	xhr.onload = function (e) {
		if (xhr.status == 200) {
			var cards = xhr.responseText.split('\n')
			loadCards(cards)
		}
	};
	xhr.send();
}

// 鼠标移动到按钮上选中复选框
function check(idx) {
	var checkboxs = document.getElementsByClassName('checkbox');
	checkboxs[idx].checked = !checkboxs[idx].checked;
}

// 自动加载远程excel
readWorkbookFromRemoteFile('https://hieda-no-tzz.github.io/TouHou.github.io/角色曲列表.xlsx', function (workbook) {
	readWorkbook(workbook);
});

// 对曲表文件选择器添加监听
$(function () {
	document.getElementById('file').addEventListener('change', function (e) {
		var files = e.target.files;
		if (files.length == 0) return;
		var f = files[0];
		if (/\.xlsx$/g.test(f.name)) {
			readWorkbookFromLocalFile(f, function (workbook) {
				readWorkbook(workbook);
			});
		}
		else if (/\.csv$/g.test(f.name)) {
			readCSVFromLocalFile(f, function (workbook) {
				readCSV(workbook);
			});
		}
		else {
			alert('仅支持读取xlsx或csv格式！');
			return;
		}
	});
});

// 对角色表文件选择器添加监听
$(function () {
	document.getElementById('cardfile').addEventListener('change', function (e) {
		var files = e.target.files;
		for (i = 0; i < files.length; ++i) {
			var f = files[i]
			var reader = new FileReader();
			reader.onload = function () {
				var cards = this.result.split('\n')
				loadCards(cards)
			}
			reader.readAsText(f);
		}
	})
})

// 对answerBolck添加touch监听
$(function() {
	document.getElementById('answerBlock').addEventListener("touchstart", dealAnswerBlockTouchStart)
	document.getElementById('answerBlock').addEventListener("touchmove", dealAnswerBlockTouchMove)
	document.getElementById('answerBlock').addEventListener("touchend", dealAnswerBlockTouchEnd)
	document.getElementById('answerBlock').addEventListener("dragstart", dealDragStart)
	document.getElementById('answerBlock').addEventListener("drag", dealDragMove)
	document.getElementById('answerBlock').addEventListener("dragend", dealDragEnd)
})