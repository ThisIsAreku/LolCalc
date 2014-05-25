function LolCalc () {
	this.runePageValues = [];
	this.runePages = [];
	this.currentRunePage = 0;
}

function RuneSet () {

}

function ItemSet () {

}

function Masteries () {

}

function Champion () {
	this.key = null;
	this.level = 1;
}



function Build () {
	this.champion = new Champion();
	this.masteries = new Masteries();
	this.runes = new RuneSet();
	this.items = new ItemSet();
}
Build.prototype.compile = function() {
	
};