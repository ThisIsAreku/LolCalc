var LolCalc = new function () {
	this.runePageValues = [];
	this.runePages = [];
	this.currentRunePage = 0;
	this.builds = {};
	this.currentBuildIndex = 0;
	this.builds[0] = new Build();


	this.getBuild = function (n){
		if('undefined' === typeof n)
			n = this.currentBuildIndex;
		return this.builds[n];
	}
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