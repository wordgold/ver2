"use strict";
var service = "http://www.zkjan.com/kstk-api/";
service = "http://192.168.3.15/kstk-api/";
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
}]).value('NType', ["", "首页资讯", "通知公告", "行业热点", "法律法规", "技巧心得", "地方资讯", "专题报道", "考试须知"]);
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
		es = new Array(),
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
	s.bind = function(e) {
		es.push(e);
	};
	s.fire = function() {
		for (var i = es.length; i--;) {
			es[i]();
		}
		getNews();
	}
	s.check = function() {
		$http.post(service + "webuser/checkCookies").success(function(response) {
			if (response.code == 200) {
				s.info = response.list;
				s.logined = true;
				s.car = response.carCount;
				s.showPanl = false;
				s.fire();
			} else if (location.href.indexOf("/user/") > 0) location.href = s.loginURL;
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
	s.pay = function(id) {
		user.judge(function(id) {
			$http.post(service + "?id=" + id).success(function(response) {

			});
		}, id)
	}
	s.fromURL = encodeURIComponent(location.href);
	s.loginURL = "<!--#echo var='ver1'-->login.html?href=" + s.fromURL;
	s.registerURL = "<!--#echo var='ver1'-->register.html?href=" + s.fromURL;
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
			return url.length < 4 ? "" : url[3];
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

base.controller('scene', function($scope, $http, $attrs, fac, hash, animate) {
	$scope.hash = hash.set({
		rows: $attrs.rows || 10
	});
	$http.post(service + "frontIndex/getAllFrontsceneNf").success(function(response) {
		if (response.code == 200) {
			$scope.ylist = response.list;
			if (!$scope.hash.year)
				$scope.hash.year = response.list[0].year
			$scope.get(hash.page || 1);
		}
	});

	$scope.setYear = function(i) {
		if (i != $scope.hash.year) {
			$scope.hash.year = i;
			$scope.get(1, true)
		}
	}

	$scope.page = {};
	$scope.loading = false;
	$scope.get = function(i, b) {
		if (b || i != $scope.index) {
			if (b || i != $scope.page.index) {
				$scope.loading = true;
				$scope.page.index = i;
				$http.post(service + "frontIndex/getAllFrontscene?rows=" + hash.rows + "&page=" + $scope.page.index + "&year=" + $scope.hash.year).success(function(response) {
					$scope.loading = false;
					if (response.code == 200) {
						$scope.list = response.list;
						$scope.page = fac.page($scope.page.index, hash.rows, response.total)
						if ($attrs.rows)
							$scope.play($scope.list[0])
						if (hash.id)
							for (var i = $scope.list.length; i--;) {
								if ($scope.list[i].order_id == hash.id) {
									$scope.slist = $scope.list[i].slist;
									return;
								}
							}
					}
				});
			}
		}
	}

	$scope.play = function(p) {
		$scope.plist = p.slist;
		$scope.sa = animate.slider($scope.plist.length);
		$scope.sa.play()
	}
})

base.controller('home', function($scope, $http, user, animate) {
	$scope.user = user;
	$http.post(service + "frontIndex/getHomeInfomation?type=2").success(function(response) {
		if (response.code == 200)
			$scope.tlist = response.list;
		$scope.ta = animate.rotation($scope.tlist.length * 40, 40);
		$scope.ta.play()
	});
})

base.controller('newsList', function($scope, $http, $attrs, $sce, hash, fac, NType) {
	$scope.hash = hash.init({
		sid: 0,
		type: 6
	}).set({
		type: $attrs.type,
		rows: $attrs.rows || 10
	});

	$scope.ntype = NType[hash.type]
	if (fac.nav() != "")
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
					$scope.page = fac.page($scope.page.index, hash.rows, response.total)
				}
			});
		}
	}
	$scope.get($attrs.page || 1)

	if (hash.type == 8) {
		$scope.html = function(s) {
			return $sce.trustAsHtml(s);
		}
		$scope.go = function(i) {
			$scope.hash.sid = i;
			var t = document.getElementById("title_h3" + i)
			fac.scrollTo(t.offsetTop + 240)
		}
		var fixed = 1;
		window.onscroll = function() {
			if (fixed && document.body.scrollTop > 280) {
				fixed = 0;
				document.getElementById("help_l1").className = "nav_l box f_biger fixed";
			}
			if (!fixed && document.body.scrollTop < 280) {
				fixed = 1;
				document.getElementById("help_l1").className = "nav_l box f_biger";
			}
		}
	}
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

base.controller('qlist', function($scope, $http, $filter, fac, hash, QType) {
	$scope.nlist = QType;
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

	$scope.rt = hash.init({
		type: $scope.slist[0].type,
		errtype: 1
	});
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
		$scope.loading = true;
		$http.get(service + "exam/removerrStudy?qid=" + qid + $scope.errtype).success(function(response) {
			$scope.get($scope.page.index, true);
		});
	}
	$scope.addStar = function(s) {
		s.colled = true;
		$http.get(service + "exam/addStudy?qid=" + s.qid + (s.checked ? "&answers=" + s.checked : "")).success(function(response) {
			if ($scope.rt.type == $scope.slist[1].type) $scope.get($scope.page.index, true);
		});
	}
	$scope.delStar = function(s) {
		s.colled = false;
		$http.get(service + "exam/removeStudy?qid=" + s.qid).success(function(response) {
			if ($scope.rt.type == $scope.slist[1].type) $scope.get($scope.page.index, true);
		});
	}
})

base.controller('help', function($scope, $http, fac, hash) {
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

base.controller('login', function($scope, $http, fac, hash) {
	$scope.href = encodeURIComponent(hash.href);
	$scope.checked = "1";
	$scope.sub = function() {
		$http.post(service + "webuser/login", fac.serialize($scope.user)).success(function(response) {
			if (response.code == 200) location.href = fac.orHome(hash.href);
			else $scope.errMsg = response.msg;
		});
	}
})

base.controller('register', function($scope, $http, $interval, fac, hash) {
	$scope.hashHref = encodeURIComponent(hash.href);
	$scope.href = fac.orHome(hash.href);
	$scope.r = 0;
	$scope.ran = function() {
		$scope.r++;
	}
	$http.post(service + "frontIndex/getAllFrontMajor").success(function(response) {
		if (response.code == 200) {
			$scope.list = response.list;
			$scope.ma = response.list[0].id;
		}
	});
	$scope.send = function(ph) {
		if ($scope.user.ph.$valid) {
			$scope.errMsg = "";
			$http.get(service + "webuser/getCode?ph=" + ph + "&vcode=" + $scope.imgcode).success(function(response) {
				$scope.r++;
				if (response.code == 200) {
					$scope.s = 60;
					$scope.sended = true;
					var stop = $interval(function() {
						if ($scope.s) $scope.s--;
						else {
							$scope.sended = false;
							$interval.cancel(stop);
						}
					}, 999)
				} else $scope.errMsg = response.msg;
			})
		}
	}
	$scope.readed = true;
	$scope.sub = function() {
		$scope.errMsg = "正在请求，请稍候…"
		$http.post(service + "webuser/regist", fac.serialize($scope.user)).success(function(response) {
			if (response.code == 200) {
				$scope.ok = true;
				$scope.s = 3;
				$interval(function() {
					if ($scope.s) $scope.s--;
					else {
						location.href = $scope.href;
					}
				}, 999)
			} else {
				$scope.errMsg = response.msg;
			}
		});
	}
})

base.controller('findpwd', function($scope, $http, $interval, fac, hash) {
	$scope.hashHref = encodeURIComponent(hash.href);
	$scope.ph = hash.ph;
	$scope.href = fac.orHome(hash.href);
	$scope.r = 0;
	$scope.ran = function() {
		$scope.r++;
	}
	$scope.send = function(ph) {
		if ($scope.phone.ph.$valid) {
			$scope.errMsg = "";
			$http.get(service + "webuser/findPh?ph=" + ph).success(function(response) {
				if (response.code == 200) {
					$http.get(service + "webuser/getCode?reg=1&ph=" + ph + "&vcode=" + $scope.imgcode).success(function(response) {
						$scope.r++;
						if (response.code == 200) {
							$scope.s = 60;
							$scope.sended = true;
							var stop = $interval(function() {
								if ($scope.s) $scope.s--;
								else {
									$scope.sended = false;
									$interval.cancel(stop);
								}
							}, 999)
						} else $scope.errMsg = response.msg;
					})
				} else $scope.errMsg = response.msg;
			})
		}
	}
	$scope.step = 1;
	$scope.sub1 = function() {
		$scope.errMsg = "正在请求，请稍候…"
		$http.post(service + "webuser/findUpPwd", fac.serialize($scope.phone)).success(function(response) {
			if (response.code == 200) {
				$scope.errMsg = "";
				$scope.step = 2;
				$scope.key = response.list[0].key;
			} else {
				$scope.errMsg = response.msg;
			}
		});
	}
	$scope.sub2 = function() {
		$scope.errMsg = "正在请求，请稍候…"
		$http.post(service + "webuser/updateAppUserPassword", fac.serialize($scope.pwd)).success(function(response) {
			if (response.code == 200) {
				$scope.step = 3;
				$scope.s = 3;
				$interval(function() {
					if ($scope.s) $scope.s--;
					else {
						location.href = $scope.href;
					}
				}, 999)
			} else {
				$scope.errMsg = response.msg;
			}
		});
	}
})

base.controller('search', function($scope, $http, fac, hash) {
	$scope.hash = hash;
	$scope.rows = 20;
	$scope.page = {};
	$scope.loading = false;
	$scope.get = function(i, b) {
		if (b || i != $scope.page.index) {
			$scope.loading = true;
			$scope.page.index = i;
			$http.post(service + "frontIndex/getAllIndexfvideo?page=" + $scope.page.index + "&rows=" + $scope.rows + "&name=" + encodeURIComponent($scope.hash.hsname) + "&type=" + $scope.hash.hstype).success(function(response) {
				$scope.loading = false;
				if (response.code == 200) {
					if ($scope.hash.hstype == 1) $scope.list = fac.grade(response.list);
					else $scope.list = response.list;
					$scope.page = fac.page($scope.page.index, $scope.rows, response.total)
				}
			});
		}
	}
	$scope.get(1)
})

base.controller('student', function($scope, $http, animate) {
	$http.post(service + "exam/getBmxy").success(function(response) {
		if (response.code == 200) {
			$scope.list = response.list;
			$scope.sa = animate.rotation($scope.list.length * 28, 40);
			$scope.sa.play()
		}
	});
})

base.controller('classlist', function($scope, $http, $attrs, $interval, user, fac, hash, animate) {
	$scope.rt = hash;
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
	$scope.getCourse = function(i) {
		$http.post(service + "frontIndex/getAllFrontCourseByMid?major_id=" + $scope.rt.mid).success(function(response) {
			if (response.code == 200) {
				$scope.clist = response.list;
				if (!$scope.cid) $scope.rt.cid = 0;
			}
		});
	};
	$scope.setMid = function(id) {
		if (id && $scope.rt.mid != id) {
			$scope.rt.mid = id;
			$scope.cid = "";
			$scope.getCourse();
			$scope.get(1, true);
		}
	};
	$scope.setCid = function(id, i) {
		if ($scope.rt.cid != id) {
			$scope.rt.cid = id;
			$scope.cid = id ? "&cid=" + id : "";
			$scope.get(1, true);
		}
	};

	$scope.rows = 20;
	$scope.page = {};
	$scope.loading = false;
	$scope.cid = $scope.rt.cid ? "&cid=" + $scope.rt.cid : "";
	$scope.get = function(i, b) {
		if (b || i != $scope.page.index) {
			$scope.loading = true;
			$scope.page.index = i;
			$http.post(service + "gradeFront/getGradeByCid?page=" + $scope.page.index + "&rows=" + $scope.rows + "&mid=" + $scope.rt.mid + $scope.cid).success(function(response) {
				$scope.loading = false;
				if (response.code == 200) {
					$scope.list = response.list;
					$scope.page = fac.page($scope.page.index, $scope.rows, response.total)
				}
			});
		}
	}
})

base.controller('class', function($scope, $http, $sce, user, fac, hash) {
	$scope.rt = hash;
	fac.goHome($scope.rt.gid);
	$http.post(service + "gradeFront/getVideoBygid?gid=" + $scope.rt.gid).success(function(response) {
		if (response.code == 200) {
			$scope.content = response.list.content;
			$scope.description = $sce.trustAsHtml(response.list.description);
			$scope.glist = response.list.glist || [response.list];
			$scope.grade_name = $scope.glist[0].name;
			document.title = $scope.grade_name + " - 中科建安";
			$scope.vlist = $scope.glist[0].flist;
			$scope.info = {
				id: response.list.id,
				buy: response.list.buy,
				status: false
			}
			if ($scope.rt.vid) $scope.getVideo($scope.rt.vid, true);
			else $scope.getVideo($scope.vlist[0].id)
		}
	});
	$scope.changeList = function(f) {
		$scope.grade_name = f.name;
		document.title = $scope.grade_name + " - 中科建安";
		$scope.vlist = f.flist;
		$scope.getVideo($scope.vlist[0].id)
	}
	$scope.getVideo = function(id, b) {
		if (b || id != $scope.rt.vid) {
			for (var i = $scope.vlist.length; i--;) {
				if (id == $scope.vlist[i].id) $scope.video = $scope.vlist[i]
			}
			$http.post(service + "gradeFront/getByVId?gid=" + $scope.video.gid + "&vid=" + id).success(function(response) {
				if (response.code == 200) {
					$scope.rt.vid = id;
					var da = response.url,
						flashvars = {
							f: da,
							s: '0',
							c: '0',
							e: '0',
							v: '80',
							p: '1',
							h: '0',
							my_url: encodeURIComponent(location.href)
						},
						params = {
							bgcolor: '#FFF',
							allowFullScreen: true,
							allowScriptAccess: 'always'
						};
					CKobject.embed('<!--#echo var="ver1"-->ckplayer/ckplayer.swf', 'video1', 'ckplayer_video1', '100%', '100%', false, flashvars, [da], params);
				} else if (response.code == -1) user.show($scope.getVideo, [id, b])
				else alert(response.msg)
			});
			$http.post(service + "gradeFront/findTBygid?gid=" + $scope.video.gid).success(function(response) {
				if (response.code == 200) {
					$scope.list = response.list;
				}
			});
		}
	}
	var n = 0,
		total_time, current_time = 0;
	window.ckplayer_status = function(str) {
		var a = str.split(":")
		if (a[0] == "totaltime") total_time = a[1];
		if (a[0] == "time") current_time = a[1];
		n++;
		if (n % 40 == 0) {
			$http.post(service + "gradeFront/upVideoPro?vid=" + $scope.rt.vid + "&current_time=" + current_time + "&total_time=" + total_time)
		}
		if (a[0] == "ended") {
			$http.post(service + "gradeFront/upVideoPro?vid=" + $scope.rt.vid + "&current_time=" + total_time + "&total_time=" + total_time)
		}
	}
	$scope.panl = 0;
	$scope.clist = new Array();
	$scope.price = {
		l: 0,
		p: 0,
		s: 0,
		c: 0,
		gids: new Array()
	}
	$http.post(service + "gradeFront/getPackage?gid=" + $scope.rt.gid).success(function(response) {
		if (response.code == 200) {
			if (response.list.length) {
				angular.forEach(response.list[0].glist, function(v) {
					v.checked = true;
					$scope.price.l++;
					$scope.price.c += (v.cmoney - 0);
					$scope.price.gids.push(v.gid);
					if (v.gid == $scope.rt.gid) {
						$scope.t = v;
					} else {
						$scope.clist.push(v)
					}
				})
				$scope.price.p = response.list[0].price - 0;
				$scope.price.s = $scope.price.c - $scope.price.p;
			}
		}
	});
	$scope.getPrice = function() {
		$scope.price = {
			l: 1,
			p: 0,
			s: 0,
			c: $scope.t.cmoney - 0,
			gids: new Array()
		}
		$scope.price.gids.push($scope.t.gid);
		for (var i = $scope.clist.length; i--;) {
			if ($scope.clist[i].checked) {
				$scope.price.l++;
				$scope.price.c += $scope.clist[i].cmoney - 0;
				$scope.price.gids.push($scope.clist[i].gid);
			}
		}
		$http.post(service + "gradeFront/gradeUserOrderm?gids=" + ($scope.id = $scope.price.gids.join())).success(function(response) {
			if (response.code == 200) {
				$scope.price.p = response.price - 0;
				$scope.price.s = $scope.price.c - $scope.price.p;
			}
		});
	}
	$scope.user = user;
})

base.controller('userNav', function($scope, $attrs) {
	$scope.nid = $attrs.nid;
	$scope.mid = $attrs.mid;
	$scope.list = [{
		name: "学习计划",
		href: "javascript:",
		list: [{
			name: "观看视频",
			href: "plan_v.html"
		}, {
			name: "练习试题",
			href: "plan_t.html"
		}]
	}, {
		name: "我的课程",
		href: "class.html"
	}, {
		name: "我的题库",
		href: "javascript:",
		list: [{
			name: "错题记录",
			href: "test.html"
		}, {
			name: "我的收藏",
			href: "test.html?type=MyStudyCollQuestion"
		}]
	}, {
		name: "我的通知",
		href: "news.html"
	}, {
		name: "我的订单",
		href: "order.html"
	}, {
		name: "我的购物车",
		href: "car.html"
	}, {
		name: "账号与安全",
		href: "javascript:",
		list: [{
			name: "个人资料",
			href: "detail.html"
		}, {
			name: "修改头像",
			href: "avatar.html"
		}, {
			name: "修改密码",
			href: "password.html"
		}]
	}];
	document.title = ($scope.mid != undefined ? $scope.list[$scope.nid].list[$scope.mid].name : $scope.list[$scope.nid].name) + "-学习中心";
})

base.controller('plan', function($scope, $http, $attrs) {
	$http.post(service + "frontIndex/getAllMyMajor").success(function(response) {
		if (response.code == 200) {
			$scope.mlist = response.list;
			$scope.mid = $scope.mlist[0].id;
			$scope.getCourse();
			$scope.setCid(36);
		}
	});
	$scope.getCourse = function(i) {
		$scope.clist = $scope.mlist[i || 0].clist;
		$scope.setCid($scope.clist[0].id);
	};
	$scope.setMid = function(id, i) {
		if (id && $scope.mid != id) {
			$scope.mid = id;
			$scope.getCourse(i);
			$scope.get(1, true);
		}
	};
	$scope.setCid = function(id) {
		if ($scope.cid != id) {
			$scope.cid = id;
			$scope.get(1, true);
		}
	};

	$scope.show = function(q,gid) {
		q.showList = !q.showList;
		if(q.showList && !q.list){
			$http.post(service + "webuser/getMy" + $attrs.order + "?gid=" + gid + "&order_id=" + q.order_id).success(function(response) {
				if (response.code == 200) {
					q.list = response.list;
				}
			});
		}
	}

	$scope.loading = false;
	$scope.get = function(b) {
		$scope.loading = true;
		$scope.list = [];
		$http.post(service + "webuser/getMy" + $attrs.type + "?rows=99&mid=" + $scope.mid + "&cid=" + $scope.cid).success(function(response) {
			$scope.loading = false;
			if (response.code == 200) {
				$scope.list = response.list;
				for (var i = $scope.list.length; i--;) {
					if (!$scope.list[i].jdlist.length) $scope.list.splice(i, 1)
				}
			}
		});
	}
})

base.controller('myclass', function($scope, $http) {
	$http.post(service + "webuser/getMyGrade?page=1&rows=99").success(function(response) {
		$scope.loading = false;
		if (response.code == 200) {
			$scope.list = response.list;
		}
	});
})

base.controller('news', function($scope, $http, $sce, hash, user) {
	$scope.hash = hash;
	$scope.user = user;
	$scope.html = function(s) {
		return $sce.trustAsHtml(s);
	}
	if ($scope.hash.id)
		$http.get(service + "webuser/getNewsByid?nid=" + $scope.hash.id).success(function(response) {
			if (response.code == 200) {
				$scope.info = response.list[0];
			} else {
				alert(response.msg)
				location.href = '<!--#echo var="ver1"-->user/news.html'
			}
		})
})

base.controller('detail', function($scope, $http, fac, user) {
	$http.post(service + "frontIndex/getAllFrontMajor").success(function(response) {
		if (response.code == 200) {
			$scope.list = response.list;
		}
	});
	$http.post(service + "webuser/getPros").success(function(response) {
		if (response.code == 200) {
			response.list.unshift({
				id: 0,
				province_name: "请选择所在地区"
			})
			$scope.plist = response.list;
		}
	});
	$scope.user = user;
	$scope.sub = function() {
		if ($scope.info.$invalid) $scope.errMsg = '请完整填写所有标注 * 的必填项'
		else {
			$scope.errMsg = "正在请求，请稍候…"
			$http.post(service + "webuser/updateAppUser", fac.serialize($scope.info)).success(function(response) {
				if (response.code == 200) {
					$scope.errMsg = "修改成功";
					setTimeout(function() {
						$scope.errMsg = "";
					}, 3000)
				} else {
					$scope.errMsg = response.msg;
				}
			});
		}
	}
})

base.controller('avatar', function($scope, user) {
	$scope.user = user;
	var upload = function(file) {
		var fileData = new FormData(),
			xhr = new XMLHttpRequest();
		if (!/(.*)+\.(jpg|jpeg|gif|png)$/i.test(file.name)) {
			alert("文件类型错误");
			return false;
		}
		if (file.size > 1024 * 1024) {
			alert("图片必须小于1M");
			return false;
		}
		fileData.append("file", file)
		$uploading.style.display = "block";
		xhr.open("post", service + "webuser/updateUserLogo");
		xhr.upload.onprogress = function(e) {
			if (e.lengthComputable) {
				var p = (e.loaded / e.total * 100 | 0)
				$up1.innerHTML = p;
			}
		};
		xhr.onload = function() {
			if (this.status == 200) {
				$uploading.style.display = "none";
				var r = JSON.parse(this.response)
				if (r.code == 200) user.check();
			} else alert("Error Code: " + this.status)
		}
		xhr.send(fileData);
	};
	var $upload = document.getElementById('upload'),
		$uploading = document.getElementById('uploading'),
		$up1 = document.getElementById('up1');
	$upload.addEventListener("change", function() {
		upload(this.files[0]);
		this.value = "";
	})
	$upload.addEventListener("dragenter", function() {
		return false;
	})
	$upload.addEventListener("dragover", function() {
		return false;
	})
	$upload.addEventListener("drop", function(e) {
		upload(e.dataTransfer.files[0])
		e.stopPropagation();
		e.preventDefault();
	}, 0)
})

base.controller('password', function($scope, $http, fac) {
	$scope.sub = function() {
		$scope.errMsg = "正在请求，请稍候…"
		$http.post(service + "webuser/updateUserPassword", fac.serialize($scope.pwd)).success(function(response) {
			if (response.code == 200) {
				$scope.errMsg = "修改成功，请重新登录"
				setTimeout(function() {
					location.href = "<!--#echo var='ver1'-->login.html";
				}, 999)
			} else {
				$scope.errMsg = response.msg;
			}
		});
	}
})

base.controller('download', function($scope, $http, $attrs, fac, hash, user) {
	$http.post(service + "frontIndex/getAllFrontMajor").success(function(response) {
		if (response.code == 200) {
			$scope.mlist = response.list;
			hash.init({
				mid: $scope.mlist[0].id
			});
			$scope.get(1)
		}
	});
	$scope.hash = hash.set({
		rows: $attrs.rows || 20
	});
	$scope.user = user;
	$scope.page = {};
	$scope.loading = false;
	$scope.get = function(i, b) {
		if (b || i != $scope.page.index) {
			$scope.loading = true;
			$scope.page.index = i;
			$http.post(service + "frontIndex/getMaterial?page=" + $scope.page.index + "&rows=" + hash.rows + "&mid=" + $scope.hash.mid).success(function(response) {
				$scope.loading = false;
				if (response.code == 200) {
					$scope.list = response.list;
					$scope.page = fac.page($scope.page.index, hash.rows, response.total)
				}
			});
		}
	}
})

base.controller('enter', function($scope, fac) {
	$scope.goTo = function(i, h) {
		$scope.a = i;
		fac.scrollTo(i * 40 + 40 + h)
	}
})

base.controller('car', function($scope, $http, user) {
	$scope.checked = $scope.price = 0;
	$http.post(service + "gradeFront/getShopcar").success(function(response) {
		if (response.code == 200) {
			$scope.list = response.list;
		}
	});

	$scope.for = function(func) {
		for (var l = $scope.list.length; l--;) {
			func($scope.list[l])
		}
	}
	$scope.pick = function(i) {
		$scope.checked = $scope.price = 0;
		$scope.for(function(item) {
			if (item.checked) {
				$scope.checked++;
				$scope.price += item.cmoney - 0;
			}
		})
		$scope.all = $scope.checked == $scope.list.length;
	}
	$scope.pickAll = function() {
		$scope.price = 0;
		if ($scope.all) {
			$scope.checked = $scope.list.length;
			$scope.for(function(item) {
				item.checked = true;
				$scope.price += item.cmoney - 0;
			});
		} else {
			$scope.checked = 0;
			$scope.for(function(item) {
				item.checked = false;
			});
		}
	}
	$scope.del = function(i) {
		$http.post(service + "gradeFront/removeShopcar?ids=" + $scope.list[i].sid);
		$scope.list.splice(i, 1);
		user.car = $scope.list.length;
		$scope.pick();
	}
	$scope.delChecked = function() {
		var s = new Array(),
			ls = new Array();
		$scope.for(function(item) {
			if (item.checked)
				s.push(item.sid)
			else
				ls.push(item)
		});
		$scope.list = ls;
		user.car = $scope.list.length;
		$http.post(service + "gradeFront/removeShopcar?ids=" + s.join());
	}
	$scope.delAll = function() {
		var s = new Array();
		$scope.for(function(item) {
			s.push(item.sid)
		});
		user.car = $scope.list.length = 0;
		$http.post(service + "gradeFront/removeShopcar?ids=" + s.join());
	}
	$scope.pay = function(id) {
		if ($scope.checked && !$scope.loading) {
			$scope.loading = " 中";
			var s = new Array();
			$scope.for(function(item) {
				if (item.checked) {
					s.push(item.sid);
				}
			});
			$http.post(service + "gradeFront/createOrder?ids=" + s.join()).success(function(response) {
				if (response.code == 200) {
					location.href = "<!--#echo var='ver1'-->user/pay.html?id=" + response.orderid;
				} else $scope.loading = "";
			});
		}
	}
})

base.controller('pay', function($scope, $http, $interval, fac, hash) {
	fac.goHome(hash.id);
	$scope.alipay = service + "webali/pay?id=" + hash.id;
	$scope.wechat = service + "webchat/pay?id=" + hash.id;
	$scope.checkStr = "检查支付状态";
	$scope.payStr = hash.pay ? '订单尚未支付，请尽快付款！' : '订单创建成功，请尽快付款！';
	$scope.get = function() {
		if ($scope.check) $scope.checkStr = "正在检查…"
		$http.post(service + "gradeFront/findOrderbyid?id=" + hash.id).success(function(response) {
			if (response.code == 200) {
				$scope.money = response.list[0].money;
				$scope.no = response.list[0].out_trade_no;
				$scope.status = response.list[0].status;
				if ($scope.check && !$scope.status) $scope.checkStr = "尚未支付成功，重新检查"
			} else fac.goHome(0);
		});
	}
	$scope.get();
	var stop = $interval(function() {
		$http.post(service + "gradeFront/findOrderbyid?id=" + hash.id).success(function(response) {
			if (response.code == 200) {
				$scope.status = response.list[0].status;
				if ($scope.status) $interval.cancel(stop);
			}
		});
	}, 9999)
})

base.controller('order', function($scope, $http, fac, hash) {
	$scope.hash = hash.init({
		status: 1
	});
	$scope.checked = 0;
	$scope.rows = 10;
	$scope.list = new Array(new Array(), new Array(), new Array());
	$http.post(service + "webuser/getMyOrder").success(function(response) {
		if (response.code == 200) {
			angular.forEach(response.list, function(v, i) {
				$scope.list[v.status].push(v);
			})
			$scope.get(1)
		}
	});
	$scope.set = function(i) {
		$scope.hash.status = i;
		$scope.get(1);
	}
	$scope.get = function(i) {
		$scope.page = fac.page(i, $scope.rows, $scope.list[$scope.hash.status].length)
		$scope.list[2] = $scope.list[$scope.hash.status].slice(($scope.page.index - 1) * $scope.rows, $scope.page.index * $scope.rows);
		$scope.pick();
	}
	$scope.pick = function(i) {
		$scope.checked = 0;
		var l = $scope.list[2].length;
		for (; l--;) {
			if ($scope.list[2][l].checked) {
				$scope.checked++;
			}
		}
		$scope.all = $scope.checked == $scope.list[2].length;
	}
	$scope.pickAll = function() {
		$scope.price = 0;
		var l = $scope.list[2].length;
		if ($scope.all) {
			$scope.checked = l;
			for (; l--;) {
				$scope.list[2][l].checked = true;
			}
		} else {
			$scope.checked = 0;
			for (; l--;) {
				$scope.list[2][l].checked = false;
			}
		}
	}
	$scope.del = function(id, i) {
		$http.post(service + "webuser/removeMyOrder?ids=" + id);
		$scope.list[$scope.hash.status].splice(($scope.page.index - 1) * $scope.rows + i, 1)
		$scope.get(1);
	}
	$scope.delChecked = function() {
		var list = new Array(),
			s = new Array();
		angular.forEach($scope.list[2], function(v) {
			if (!v.checked) {
				list.push(v);
			} else s.push(v.id)
		})
		$http.post(service + "webuser/removeMyOrder?ids=" + s.join());
		$scope.list[$scope.hash.status] = $scope.list[$scope.hash.status].slice(0, ($scope.page.index - 1) * $scope.rows).concat(list, $scope.list[$scope.hash.status].slice(($scope.page.index) * $scope.rows));
		$scope.get(1);
	}
})