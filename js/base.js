"use strict";
var service = "http://www.zkjan.com/kstk-api/";
// service = "http://192.168.3.15/kstk-api/";
var base = angular.module('baseApp', []);
base.config(function($httpProvider) {
	$httpProvider.defaults.headers.post["Content-Type"] = 'application/x-www-form-urlencoded;charset=UTF-8';
});
base.value('QType', [{
	type: "ChaptersAndSections",
	get: "QuestionBySidFront",
	update: "qerrdb",
	name: "章节练习"
}, {
	type: "AllReal",
	get: "RealQuestion",
	update: "realdb",
	info: "RealOne",
	name: "历年真题"
}, {
	type: "AllSimul",
	get: "SimulQuestion",
	update: "simuldb",
	info: "SimulOne",
	name: "模拟考试"
}, {
	type: "DayQueston",
	get: "QuestionByDay",
	update: "qerrdb",
	name: "每日作业"
}]).value('NType',["","首页资讯","通知公告","行业资讯","法律法规","考试技巧","地方资讯","专题报道",]).value('usernav', [{
	name: "学习计划",
	href: "<!--#echo var='ver1'-->user/history.html?title=" + encodeURIComponent("学习中心")
}, {
	name: "我的课程",
	href: "<!--#echo var='ver1'-->user/myclass.html?title=" + encodeURIComponent("学习中心")
}, {
	name: "我的题库",
	href: "<!--#echo var='ver1'-->question/myquestion.html?type=ErrQuestions"
}, {
	name: "资料下载",
	href: "<!--#echo var='ver1'-->user/download.html?title=" + encodeURIComponent("学习中心")
}, {
	name: "我的通知",
	href: "<!--#echo var='ver1'-->user/news.html?title=" + encodeURIComponent("学习中心")
}, {
	name: "我的订单",
	href: "<!--#echo var='ver1'-->user/order.html?title=" + encodeURIComponent("学习中心")
}, {
	name: "我的购物车",
	href: "<!--#echo var='ver1'-->user/car.html?title=" + encodeURIComponent("学习中心")
}, {
	name: "账号与安全",
	href: "<!--#echo var='ver1'-->user/detail.html?title=" + encodeURIComponent("学习中心")
}]).value('exam', ["报名时间", "报名条件", "考试内容", "考试费用", "考试时间", "合格标准", "报名入口", "成绩查询"]);
base.filter("slice", function() {
	return function(s, l) {
		return (s && s.length > l) ? s.slice(0, l - 1) + "..." : s;
	}
}).filter("abcd", function() {
	return function(s, l) {
		return ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"][s];
	}
}).filter("xyz", function() {
	return function(s, l) {
		return ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"][s];
	}
}).filter("justDay", function() {
	return function(s) {
		return s && s.split(" ")[0];
	}
}).filter("money", function() {
	return function(s) {
		return (!s || isNaN(s)) ? "0.00" : (Math.ceil(Math.floor(parseFloat(s) * 1000) / 10) / 100).toFixed(2)
	}
})

base.service("user", function($http) {
	var s = this,
		callBack, attrs,
		getNews = function() {
			$http.post(service + "webuser/getNews").success(function(response) {
				if (response.code == 200) {
					s.news = response.list;
					s.unread = 0;
					for (var i = s.news.length; i--;) {
						if (!s.news[i].is_read) s.unread++;
					}
					setTimeout(getNews, 99999)
				}
			});
		}
	s.check = function() {
		$http.post(service + "webuser/checkCookies").success(function(response) {
			if (response.code == 200) {
				s.nickname = response.list.nickname;
				s.logo = response.list.logo;
				s.logined = true;
				s.car = response.carCount;
				s.showPanl = false;
				getNews();
			} //else if (location.href.indexOf("/user/") > 0) location.href = s.loginURL;
		});
	}
	s.out = function() {
		$http.post(service + "webuser/loginout").success(function(response) {
			if (location.href.indexOf("/user/") > 0) location.href = s.loginURL;
		})
		s.nickname = "";
		s.logined = false;
	}
	s.login = function(ph, pw, checked) {
		$http.post(service + "webuser/login", "ph=" + ph + "&pw=" + pw + "&checked=" + checked).success(function(response) {
			if (response.code == 200) {
				s.nickname = response.list.nickname;
				s.logined = true;
				s.car = response.carCount;
				s.showPanl = false;
				callBack.apply(null, attrs);
			} else s.errMsg = response.msg;
		});
	}
	s.show = function(f, o) {
		s.showPanl = true;
		callBack = f;
		attrs = o;
	}
	s.judge = function(f, o) {
		if (s.logined) {
			f.apply(null, o);
		} else s.show(f, o)
	}
	s.buy = function(o, go) {
		s.judge(function(o, go) {
			if (!o.status) {
				o.status = true;
				$http.get(service + "gradeFront/addShopcar?gids=" + o.id).success(function(response) {
					if (response.code == 200) {
						s.car = response.count;
						if (go) location.href = "<!--#echo var='ver1'-->user/car.html"
					} else {
						o.status = false;
						alert(response.msg);
					}
				})
			} else location.href = "<!--#echo var='ver1'-->user/car.html"
		}, [o, go])
	}
	s.loginURL = "<!--#echo var='ver1'-->user/login.html?href=" + encodeURIComponent(location.href);
	if (!s.logined) s.check();
}).service("hash", function() {
	var t = this,
		str = location.search.substr(1).split("&"),
		l = str.length,
		s;
	for (; l--;) {
		if (str[l].indexOf("=") > 0) {
			s = str[l].split("=");
			t[s[0]] = decodeURIComponent(s[1]);
		}
	}
	t.init = function(o) {
		for (var v in o) {
			if (!t[v]) t[v] = o[v]
		}
		return t;
	}
	t.set = function(o) {
		for (var v in o) {
			if (o[v] !== undefined) t[v] = o[v]
		}
		return t;
	}
	t.serialize = function(f) {
		var h = new Array();
		if (f.length)
			for (var v in t) {
				if (typeof(t[v]) != "function")
					for (var i = f.length; i--;) {
						if (v == f[i]) h.push(v + "=" + t[v]);
					}
			}
		else
			for (var v in t) {
				if (typeof(t[v]) != "function") h.push(v + "=" + t[v]);
			}
		return h.join("&")
	}
})

base.factory("fac", function() {
	return {
		goHome: function(t) {
			if (!t) location.href = "<!--#echo var='ver1'-->index.html"
		},
		goLogin: function(t) {
			if (!t) location.href = "<!--#echo var='ver1'-->user/login.html?href=" + encodeURIComponent(location.href);
		},
		orHome: function(t) {
			return t ? decodeURIComponent(t) : "<!--#echo var='ver1'-->index.html"
		},
		nav: function() {
			var url = location.href.split("/")
			return url[url.length - 2];
		},
		serialize: function(obj) {
			var a = new Array()
			angular.forEach(obj, function(v) {
				if (v.$modelValue) a.push(v.$name + "=" + encodeURIComponent(v.$modelValue))
			})
			return a.join("&")
		},
		scrollTo: function(top) {
			document.documentElement.scrollTop += 1;
			var i = 1,
				b = document.documentElement.scrollTop ? document.documentElement : document.body,
				s = (top - b.scrollTop) / 20,
				stop = setInterval(function() {
					if (++i > 20) {
						b.scrollTop = top;
						clearInterval(stop);
						return;
					}
					b.scrollTop += s;
				}, 20);
		},
		page: function(i, r, t) {
			var p = new Object();
			p.index = i;
			p.length = Math.ceil(t / r);
			if (t / r > 1) {
				p.first = (i != 1);
				p.last = (i != p.length);
				p.list = new Array();
				for (i = i - 2; i <= p.length && i < p.index + 3; i++) {
					if (i > 0) p.list.push(i);
				}
			}
			return p;
		},
		grade: function(list) {
			var i = list.length,
				l = 0,
				gid = [],
				gname = [];
			for (; i--;) {
				if (list[i].gids) {
					gid = list[i].gids.split(",");
					gname = list[i].gnames.split(",");
					list[i].grade = new Array();
					for (l = gid.length; l--;) {
						list[i].grade.push({
							gid: gid[l],
							gname: gname[l]
						})
					}
				}
			}
			return list;
		},
		vote: function(c, id, type) {
			if (type == 1) return c == id;
			else if (c) {
				var a = c.split("-");
				for (var i = a.length; i--;) {
					if (id == a[i]) return true;
				}
			}
			return false;
		},
		pen: function(a, b) {
			return (b > 0 ? Math.ceil(a / b * 100) : 0) + '%';
		}
	};
}).factory("animate", function($interval, $timeout) {
	var S = function(l, t) {
		var s = this;
		s.tid = 0;
		s.t = t || 4000;
		s.a = true;
		s.i = 0;
		s.l = l;
		s.animate = function() {
			if (s.i == s.l) {
				s.a = false;
				s.i = 0;
				$timeout(function() {
					s.a = true;
					s.i++;
				}, 99)
			} else s.i++;
		}
		s.stop = function() {
			$interval.cancel(s.tid);
		}
		s.play = function() {
			s.stop();
			s.tid = $interval(function() {
				s.animate();
			}, s.t);
		}
		s.next = function() {
			s.animate();
			s.play()
		}
		s.prev = function() {
			if (s.i == 0) {
				s.a = false;
				s.i = s.l;
				$timeout(function() {
					s.a = true;
					s.i--;
				}, 99)
			} else s.i--;
			s.play()
		}
	}
	return {
		slider: function(l, t) {
			var s = new S(l, t);
			return s;
		},
		rotation: function(l, t) {
			var s = new S(l, t);
			s.animate = function() {
				s.i++;
				if (s.i == s.l) s.i = 0;
			}
			s.prev = function() {
				s.i--;
				if (s.i < 0) s.i = s.l - 1;
			}
			return s;
		}
	}
})

base.directive('vphone', function() {
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {
			ctrl.$parsers.unshift(function(viewValue) {
				if (/^1(3[0-9]|5[0-35-9]|7[035678]|8[0-9]|47)[0-9]{8}$/.test(viewValue)) {
					ctrl.$setValidity('phone', true);
					return viewValue;
				} else {
					ctrl.$setValidity('phone', false);
					return undefined;
				}
			});
		}
	};
}).directive('vconfirm', function() {
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {
			ctrl.$parsers.unshift(function(viewValue) {
				if (scope[attrs.vconfirm] == viewValue) {
					ctrl.$setValidity('confirm', true);
					return viewValue;
				} else {
					ctrl.$setValidity('confirm', false);
					return undefined;
				}
			});
		}
	};
});

base.controller('header', function($scope, $http, $timeout, fac, hash, user) {
	$scope.user = user;
	$scope.href = encodeURIComponent(location.href);
	$scope.nav = fac.nav();

	hash.init({
		hstype: 2
	});
	$scope.type = hash.hstype;
	$scope.key = hash.hsname;

	$scope.focus = false;
	$scope.get = function(key, type) {
		if (key) {
			$scope.focus = true;
			$http.post(service + "frontIndex/getAllIndexfvideo?page=1&rows=5&name=" + encodeURIComponent(key) + "&type=" + type).success(function(response) {
				if (response.code == 200) {
					$scope.list = response.list;
				}
			});
		} else $scope.focus = false;
	}
	$scope.blur = function() {
		$timeout(function() {
			$scope.focus = false;
		}, 200)
	}
	if (hash.title) document.title = hash.title + " - 中科建安";
	$scope.goTop = function() {
		fac.scrollTo(0)
	};
})

base.controller('teacherList', function($scope, $http, $attrs, fac, hash) {
	$http.post(service + "frontIndex/getAllFrontMajor").success(function(response) {
		if (response.code == 200) {
			$scope.clist = response.list;
		}
	});

	$scope.hash = hash.init({
		mid: 0
	});;

	$scope.setMid = function(i) {
		if ($scope.hash.mid != i) {
			$scope.hash.mid = i;
			$scope.get(1, true)
		}
	}

	$scope.rows = $attrs.rows || 20;
	$scope.page = {};
	$scope.loading = false;
	$scope.get = function(i, b) {
		if (b || i != $scope.page.index) {
			$scope.loading = true;
			$scope.page.index = i;
			$http.post(service + "frontIndex/getAllFrontTeacher?page=" + $scope.page.index + "&rows=" + $scope.rows + "&mid=" + $scope.hash.mid).success(function(response) {
				$scope.loading = false;
				if (response.code == 200) {
					$scope.list = response.list;
					$scope.page = fac.page($scope.page.index, $scope.rows, response.total)
				}
			});
		}
	}
	$scope.get(1)
})

base.controller('teacher', function($scope, $http, fac, hash) {
	$scope.hash = hash;
	$http.post(service + "frontIndex/getFrontTeabyid?id=" + $scope.hash.id).success(function(response) {
		if (response.code == 200) {
			$scope.info = response.list[0];
		}
	});
	$scope.rows = 10;
	$scope.page = {};
	$scope.get = function(i) {
		if (i != $scope.page.index) {
			$scope.page.index = i;
			$http.post(service + "frontIndex/getTeacherVideo?page=" + $scope.page.index + "&rows=" + $scope.rows + "&tid=" + $scope.hash.id).success(function(response) {
				if (response.code == 200) {
					$scope.list = fac.grade(response.list);
					$scope.page = fac.page($scope.page.index, $scope.rows, response.total)
				}
			});
		}
	}
	$scope.get(1)
})

base.controller('banner', function($scope, $http, $attrs, animate) {
	$http.post(service + "frontIndex/getIndexImg").success(function(response) {
		if (response.code == 200) {
			$scope.list = response.list;
			$scope.ba = animate.rotation($scope.list.length);
			$scope.ba.play()
		}
	});
})

base.controller('scene', function($scope, $http, $attrs, hash, animate) {
	$scope.get = function(i) {
		if (i != $scope.index) {
			$scope.list = $scope.plist[$scope.index = i].slist;
			$scope.sa = animate.slider($scope.list.length);
			$scope.sa.play()
		}
	}
	$http.post(service + "frontIndex/getAllFrontscene?page=1&rows=" + ($attrs.rows || 10)).success(function(response) {
		if (response.code == 200) {
			$scope.plist = response.list;
			$scope.get(0)
		}
	});
})

base.controller('home', function($scope, $http) {
	$http.post(service + "frontIndex/getHomeInfomation?type=2").success(function(response) {
		if (response.code == 200)
			$scope.news = response.list[0];
	});
})

base.controller('newsList', function($scope, $http, $attrs, hash, fac, NType) {
	$scope.hash = hash.init({
		sid: 0,
		type: 6
	}).set({
		type: $attrs.type,
		rows: $attrs.rows || 10
	});

	$scope.ntype = NType[hash.type]
	document.title = $scope.ntype + " - 中科建安";

	$scope.page = {};
	$scope.loading = false;
	$scope.nav = ["", "", "", "行业", "", "", "地区", ""]

	if ($scope.nav[hash.type])
		$http.post(service + "frontIndex/getInfomationEj?type=" + hash.type).success(function(response) {
			if (response.code == 200) {
				$scope.clist = response.list;
			}
		});

	$scope.setSid = function(i) {
		if ($scope.hash.sid != i) {
			$scope.hash.sid = i;
			$scope.get(1, true)
		}
	}
	$scope.get = function(i, b) {
		if (b || i != $scope.page.index) {
			$scope.loading = true;
			$scope.page.index = i;
			$http.post(service + "frontIndex/getHomeInfomation?rows=" + hash.rows + "&page=" + $scope.page.index + "&type=" + $scope.hash.type + "&sid=" + $scope.hash.sid).success(function(response) {
				$scope.loading = false;
				if (response.code == 200) {
					$scope.list = response.list;
					$scope.page = fac.page($scope.page.index, $scope.rows, response.total)
				}
			});
		}
	}
	$scope.get($attrs.page || 1)
})

base.controller('newsItem', function($scope, $http, $sce, hash, NType) {
	$scope.hash = hash;
	$scope.ntype = NType;
	$scope.html = function(s) {
		return $sce.trustAsHtml(s);
	}
	$http.post(service + "infomation/getInfomationContent?zid=" + hash.id)
		.then(function(r) {
			if (r.data.code == 200) {
				$scope.info = r.data.list[0];
			}
		});
})

base.controller('qlist', function($scope, $http, $filter, fac, user, hash, QType) {
	$scope.nlist = QType;
	$scope.user = user;
	$http.post(service + "frontIndex/getAllFrontMajor").success(function(response) {
		if (response.code == 200) {
			$scope.mlist = response.list;
			if (!$scope.rt.mid) {
				if (response.selected) $scope.rt.mid = response.selected;
				else $scope.rt.mid = $scope.mlist[0].id;
			}
			$scope.getCourse();
			$scope.get(1);
		}
	});
	$scope.rt = hash.init({
		type: $scope.nlist[0].type
	});

	$scope.tlist = new Array();
	$scope.date = $filter('date')(new Date(), 'yyyy年MM月dd日');
	$scope.cid = $scope.rt.cid ? "&cid=" + $scope.rt.cid : "";
	$scope.getTlist = function() {
		$scope.tlist.length = 0;
		angular.forEach($scope.clist, function(v) {
			if (v.sublist.length) {
				angular.forEach(v.sublist, function(v) {
					var s = {
						name: v.course_name,
						mid: v.major_id,
						cid: v.id
					}
					$scope.tlist.push(s)
				})
			} else {
				var s = {
					name: v.course_name,
					mid: v.major_id,
					cid: v.id
				}
				$scope.tlist.push(s)
			}
		})
		$scope.list = $scope.tlist;
		$scope.page = {}
	}
	$scope.getCourse = function(i) {
		$http.post(service + "frontIndex/getAllFrontCourseByMid?major_id=" + $scope.rt.mid).success(function(response) {
			if (response.code == 200) {
				$scope.clist = response.list;
				if (!$scope.cid) $scope.rt.cid = 0;
				if ($scope.rt.type == $scope.nlist[3].type) $scope.getTlist();
			}
		});
	};
	$scope.setType = function(type) {
		if (type && $scope.rt.type != type) {
			$scope.rt.type = type;
			if (type == $scope.nlist[3].type) {
				$scope.getTlist();
			} else $scope.get(1, true);
		}
	};
	$scope.setMid = function(id) {
		if (id && $scope.rt.mid != id) {
			$scope.rt.mid = id;
			$scope.cid = "";
			$scope.dlist = [];
			$scope.getCourse();
			if ($scope.rt.type != $scope.nlist[3].type) $scope.get(1, true);
		}
	};
	$scope.setCid = function(id, i) {
		if ($scope.rt.cid != id) {
			$scope.rt.cid = id;
			$scope.cid = id ? "&cid=" + id : "";
			$scope.rt.did = 0;
			$scope.dlist = i > -1 ? $scope.clist[i].sublist : [];
			$scope.get(1, true);
		}
	};
	$scope.setDid = function(id) {
		if ($scope.rt.did != id) {
			$scope.rt.did = id;
			$scope.cid = id ? "&cid=" + id : ($scope.rt.cid ? "&cid=" + $scope.rt.cid : "");
			$scope.get(1, true);
		}
	};

	$scope.rows = 10;
	$scope.page = {};
	$scope.total = 0;
	$scope.loading = false;
	var scroll = false;
	$scope.get = function(i, b) {
		if (b || i != $scope.page.index) {
			if (scroll)
				fac.scrollTo(280);
			else
				scroll = true
			$scope.loading = true;
			$scope.page.index = i;
			$http.post(service + "exam/get" + $scope.rt.type + "?page=" + $scope.page.index + "&rows=" + $scope.rows + "&mid=" + $scope.rt.mid + $scope.cid).success(function(response) {
				$scope.loading = false;
				if (response.code == 200) {
					$scope.list = response.list;
					$scope.total = response.total;
					$scope.page = fac.page($scope.page.index, $scope.rows, response.total)
				}
			});
		}
	}
	$scope.getS = function(c) {
		c.showL = !c.showL;
		if (c.showL && !c.sublist) {
			$http.post(service + "exam/getSections?sid=" + c.id).success(function(response) {
				if (response.code == 200) {
					c.sublist = response.list;
				}
			});
		}
	}
})

base.controller('test', function($scope, $http, $interval, $sce, fac, user, hash, QType) {
	$scope.rt = hash;
	fac.goHome(($scope.rt.sid || $scope.rt.cid) && $scope.rt.type);
	$scope.url = location.href.split("?")[0] + "?" + hash.serialize(['mid', 'cid', 'sid', 'type', 'name'])
	window.onbeforeunload = function(e) {
		if ($scope.started && !$scope.submited) return e.returnValue = "试卷尚未保存，确认离开？";
	};
	var fixed = 1;
	window.onscroll = function() {
		if (fixed && document.body.scrollTop > 520) {
			fixed = 0;
			document.getElementById("card").className = "text_fr fixed";
		}
		if (!fixed && document.body.scrollTop < 520) {
			fixed = 1;
			document.getElementById("card").className = "text_fr";
		}
	}
	$scope.cal = false;
	$scope.drag = function(e) {
		var t = e.target.parentNode,
			tl = parseInt(t.style.marginLeft) - e.clientX,
			tt = parseInt(t.style.marginTop) - e.clientY
		t.style.opacity = 0.8;
		document.onmousemove = function(e) {
			t.style.marginLeft = tl + e.clientX + "px";
			t.style.marginTop = tt + e.clientY + "px";
			e.preventDefault();
		}
		document.onmouseup = function() {
			t.style.opacity = 1;
			document.onmousemove = null;
			document.onmouseup = null;
		}
	}
	$scope.scroll = function(id) {
		fac.scrollTo(document.getElementById(id).offsetTop + 240);
	}
	$scope.html = function(s) {
		return $sce.trustAsHtml(s);
	}
	$scope.vote = fac.vote;
	$scope.pen = fac.pen;
	$scope.start = function() {
		$scope.started = true;
		if ($scope.geted) $scope.time_play();
	}
	var time_s = 0,
		time_m = 0;
	$scope.time = "0:00";
	$scope.time_t = 0;
	$scope.time_play = function() {
		$scope.time_t = $interval(function() {
			if (time_s == 59) {
				time_m++;
				time_s = 0;
			} else time_s++;
			$scope.time = time_m + ":" + (time_s < 10 ? "0" + time_s : time_s);
			if (!$scope.showBtn && time_m > $scope.info.times) $scope.submit();
		}, 1000);
	}
	$scope.time_stop = function() {
		$interval.cancel($scope.time_t);
		$scope.time_t = 0;
	}
	$scope.showSub = function() {
		$scope.time_stop();
		$scope.showS = true;
		$scope.qlength = 0;
		var i, j;
		for (i = $scope.list.length; i--;) {
			for (j = $scope.list[i].question.length; j--;) {
				if (!$scope.list[i].question[j].checked) $scope.qlength++;
			}
		}
	}
	if ($scope.rt.type == "grade") {
		$scope.rt.get = "GradeQuestion";
		$scope.rt.update = "gradedb";
		$scope.showBtn = $scope.started = true;
	} else angular.forEach(QType, function(v, i) {
		if ($scope.rt.type == v.type) {
			$scope.rt.get = v.get;
			$scope.rt.update = v.update;
			if (i == 0 || i == 3) $scope.showBtn = $scope.started = true;
			else if (!$scope.view) {
				$http.get(service + "exam/get" + v.info + "ById?sid=" + $scope.rt.sid).success(function(response) {
					if (response.code == 200) {
						$scope.info = response.list[0];
					}
				});
			}
		}
	})
	if ($scope.rt.view) {
		$scope.started = true;
		$scope.submited = true;
		$scope.time_play = function() {
			var i, j, s;
			for (i = $scope.list.length; i--;) {
				for (j = $scope.list[i].question.length; j--;) {
					s = $scope.list[i].question[j];
					if (s.checked && getResult(s) == "yes") $scope.score++;
				}
			}
			$scope.time_play = function() {};
		};
	}
	if ($scope.rt.get == "QuestionByDay") $http.post(service + "exam/get" + $scope.rt.get + "?mid=" + $scope.rt.mid).success(function(response) {
		if (response.code == 200) {
			var q1 = new Array(),
				q2 = new Array();
			for (var i = response.list.length; i--;) {
				if (response.list[i].question_type_id == 1) q1.push(response.list[i]);
				else q2.push(response.list[i]);
			}
			$scope.list = [{
				question: q1,
				question_type_id: 1,
				question_type_name: "单选题"
			}, {
				question: q2,
				question_type_id: 2,
				question_type_name: "多选题"
			}];
			$scope.geted = true;
			if ($scope.showBtn || $scope.started) $scope.time_play();
		}
	});
	else $http.post(service + "exam/get" + $scope.rt.get + "?" + ($scope.rt.sid ? "sid=" + $scope.rt.sid : "cid=" + $scope.rt.cid)).success(function(response) {
		if (response.code == 200) {
			$scope.list = response.list;
			for (var i = response.list.length; i--;) {
				for (var j = response.list[i].question.length; j--;) {
					checkResult(response.list[i].question[j]);
				}
			}
			$scope.geted = true;
			if ($scope.showBtn || $scope.started) $scope.time_play();
		}
	});
	var split = function(s, str) {
			var a = str.split("-"),
				b = new Array(),
				c = true;
			for (var i = a.length; i--;) {
				if (s == a[i]) c = false;
				else b.push(a[i]);
			}
			if (c) b.push(s)
			return b.sort().join("-")
		},
		getResult = function(s) {
			if (!s.result) {
				s.result = new Array();
				for (var i = s.options.length; i--;) {
					if (s.options[i].is_real) s.result.push(s.options[i].id);
				}
				s.result = s.result.sort().join("-");
			}
			return s.yesno = s.result == s.checked ? "yes" : "no";
		},
		checkResult = function(s) {
			if ($scope.rt.keep && s.checked) getResult(s);
			else s.checked = ''
		}
	$scope.goVote = function(s, aid) {
		if (s.question_type_id == 1 || !s.checked) s.checked = "" + aid;
		else {
			s.checked = split(aid, s.checked);
		}
		getResult(s);
		$http.get(service + "exam/update" + $scope.rt.update + "byqid?id=" + s.qid + "&answers=" + s.checked);
	}
	$scope.score = 0;
	$scope.viewA = function(s) {
		user.judge(function() {
			s.showA = !s.showA
		})
	}
	$scope.submit = function() {
		user.judge(function() {
			$scope.scroll("test_top1");
			for (var i = $scope.list.length; i--;) {
				for (var q = $scope.list[i].question.length; q--;) {
					if ($scope.list[i].question[q].yesno == "yes") $scope.score++;
				}
			}
			$scope.submited = true;
			$scope.time_stop();
		})
	}
	$scope.addStar = function(s) {
		user.judge(function() {
			s.colled = true;
			$http.get(service + "exam/addStudy?qid=" + s.qid + (s.checked ? "&answers=" + s.checked : ""));
		})
	}
	$scope.delStar = function(s) {
		s.colled = false;
		$http.get(service + "exam/removeStudy?qid=" + s.qid);
	}
})

base.controller('mytest', function($scope, $http, $sce, fac, hash, QType) {
	$scope.nlist = QType;
	$scope.slist = [{
		type: "ErrQuestions",
		name: "错题记录"
	}, {
		type: "MyStudyCollQuestion",
		name: "我的收藏"
	}];
	$http.post(service + "frontIndex/getAllFrontMajor").success(function(response) {
		if (response.code == 200) {
			$scope.mlist = response.list;
			if (!$scope.rt.mid) {
				if (response.selected) $scope.rt.mid = response.selected;
				else $scope.rt.mid = $scope.mlist[0].id;
			}
			$scope.getCourse();
			$scope.get(1);
		}
	});
	hash.init({
		type: $scope.slist[0].type,
		errtype: 1
	});
	$scope.rt = hash;
	$scope.rows = 10;
	$scope.page = {};
	$scope.total = 0;
	$scope.loading = false;
	$scope.html = function(s) {
		return $sce.trustAsHtml(s);
	}
	$scope.vote = fac.vote;
	$scope.pen = fac.pen;
	$scope.errtype = $scope.rt.type == $scope.slist[0].type ? "&type=" + $scope.rt.errtype : "";
	$scope.cid = $scope.rt.cid ? "&cid=" + $scope.rt.cid : "";
	$scope.getCourse = function(i) {
		$http.post(service + "frontIndex/getAllFrontCourseByMid?major_id=" + $scope.rt.mid).success(function(response) {
			if (response.code == 200) {
				$scope.clist = response.list;
				if (!$scope.cid) $scope.rt.cid = 0;
			}
		});
	};
	$scope.setErrtype = function(type) {
		if (type && $scope.rt.setErrtype != type) {
			$scope.rt.errtype = type;
			$scope.errtype = "&type=" + type;
			$scope.get(1, true);
		}
	};
	$scope.setType = function(type) {
		if (type && $scope.rt.type != type) {
			$scope.rt.type = type;
			$scope.get(1, true);
		}
	};
	$scope.setMid = function(id) {
		if (id && $scope.rt.mid != id) {
			$scope.rt.mid = id;
			$scope.cid = "";
			$scope.dlist = [];
			$scope.getCourse();
			$scope.get(1, true);
		}
	};
	$scope.setCid = function(id, i) {
		if ($scope.rt.cid != id) {
			$scope.rt.cid = id;
			$scope.cid = id ? "&cid=" + id : "";
			$scope.rt.did = 0;
			$scope.dlist = i > -1 ? $scope.clist[i].sublist : [];
			$scope.get(1, true);
		}
	};
	$scope.setDid = function(id) {
		if ($scope.rt.did != id) {
			$scope.rt.did = id;
			$scope.cid = id ? "&cid=" + id : ($scope.rt.cid ? "&cid=" + $scope.rt.cid : "");
			$scope.get(1, true);
		}
	};
	$scope.get = function(i, b) {
		if (b || i != $scope.page.index) {
			$scope.loading = true;
			$scope.page.index = i;
			$http.post(service + "exam/get" + $scope.rt.type + "?page=" + $scope.page.index + "&rows=" + $scope.rows + "&mid=" + $scope.rt.mid + $scope.cid + $scope.errtype).success(function(response) {
				$scope.loading = false;
				if (response.code == 200) {
					$scope.list = response.list;
					$scope.total = response.total;
					$scope.page = fac.page($scope.page.index, $scope.rows, response.total)
				}
			});
		}
	}
	$scope.delStudy = function(qid) {
		$http.get(service + "exam/removerrStudy?qid=" + qid + $scope.errtype).success(function(response) {
			$scope.get($scope.page.index, true);
		});
	}
	$scope.addStar = function(s) {
		s.colled = true;
		$http.get(service + "exam/addStudy?qid=" + s.qid + (s.checked ? "&answers=" + s.checked : "")).success(function(response) {
			$scope.get($scope.page.index, true);
		});
	}
	$scope.delStar = function(s) {
		s.colled = false;
		$http.get(service + "exam/removeStudy?qid=" + s.qid).success(function(response) {
			$scope.get($scope.page.index, true);
		});
	}
})

base.controller('help', function($scope, $http, $sce, fac, hash) {
	hash.init({
		pid: 0,
		tid: 0
	});
	$scope.hash = hash;
	$scope.hash.href = "s" + $scope.hash.pid + $scope.hash.tid + "Html";
	$scope.nlist = [{
		name: "新手指南",
		list: ["购课流程", "常见问题"]
	}, {
		name: "支付方式",
		list: ["网银支付", "平台支付", "银行汇款", "常见支付问题"]
	}, {
		name: "售后服务",
		list: ["发票制度", "退款说明"]
	}, {
		name: "服务条款",
		list: ["购课服务", "使用协议"]
	}]
	$scope.set = function(p, t, h) {
		$scope.hash = {
			pid: p,
			tid: t,
			href: "s" + p + t + "Html"
		};
	}
})

base.controller('about', function($scope, $http, $sce, fac, hash) {
	$scope.hash = hash.init({
		pid: 0
	});
	$scope.nlist = ["企业简介", "企业文化", "招贤纳士", "联系我们"]
	$http.post(service + "frontIndex/getRecruit").success(function(response) {
		if (response.code == 200) {
			$scope.list = response.list;
			$scope.get(0)
		}
	});
	$scope.get = function(i) {
		$scope.zid = i;
		$scope.html = $sce.trustAsHtml($scope.list[i].content);
	}
})