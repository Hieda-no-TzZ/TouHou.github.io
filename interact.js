function answerBlockShiftStart(pageX) {
    answerBlockShiftStartX = pageX
}

function answerBlockShiftDuration(pageX) {
	var moveX = pageX - answerBlockShiftStartX
	var answerBlock = document.getElementById("answerBlock")
	var validMoveX = Math.max(Math.min(0, moveX), -200)
	var targetOpacity = (validMoveX / -200) * -75 + 100
	
	answerBlock.style.transform = "translate(" + validMoveX + "px, 0)"
	answerBlock.style.opacity = targetOpacity + "%"
}

function answerBlockShiftEnd(pageX) {
	var moveX = pageX - answerBlockShiftStartX
	answerBlockShiftStartX = null
	
	var answerBlock = document.getElementById("answerBlock")
	answerBlock.style.transform = "translate(0, 0)"
	answerBlock.style.opacity = "100%"
	
	// console.log(moveX)
	if (moveX < -50) {
		console.log("Shift Next")
		randomSelect(isAutoPlay = true)
	}
}

function dealAnswerBlockTouchStart(ev) {
	answerBlockShiftStart(ev.touches[0].pageX)
}

function dealAnswerBlockTouchMove(ev) {
	answerBlockShiftDuration(ev.touches[0].pageX)	
}

function dealAnswerBlockTouchEnd(ev) {
	answerBlockShiftEnd(ev.changedTouches[0].pageX)
}

function dealDragStart(ev) {
	// console.log(ev)
	answerBlockShiftStart(ev.pageX)
}

function dealDragMove(ev) {
	answerBlockShiftDuration(ev.pageX)
}

function dealDragEnd(ev) {
	answerBlockShiftEnd(ev.pageX)
}

