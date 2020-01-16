<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#3273DC">
<meta name="author" content="Sindre Sorhus">
<meta name="description" content="Full-Time Open-Sourcerer & Aspiring Rebel">
<meta property="og:type" content="website">
<meta property="og:title" content="Sindre Sorhus">
<meta property="og:url" content="https://sindresorhus.com/">
<meta property="og:description" content="Full-Time Open-Sourcerer & Aspiring Rebel">
<meta property="og:image" content="https://sindresorhus.com/sindre-sorhus.jpg">
<meta name="twitter:card" content="summary">
<meta name="twitter:site" content="@sindresorhus">
<meta name="twitter:creator" content="@sindresorhus">
<meta name="x-build-time" content="Fri, 10 Jan 2020 05:43:16 +0000">
<title>Sindre Sorhus</title>
<link rel="alternate" type="application/rss+xml" title="Sindre Sorhus' blog" href="https://blog.sindresorhus.com/feed">
<link rel="preload" href="/font-awesome.woff" as="font" crossorigin>
<link rel="icon" href="/favicon.png" sizes="32x32">
<link rel="stylesheet" href="/main.css">
<script type="module" src="/main.js"></script>
<script src="/assets/javascript/timeago.min.js"></script>
<script type="module" src="/index.js"></script>

<script async src="https://www.googletagmanager.com/gtag/js?id=UA-25562592-1"></script>
<script>
			window.dataLayer = window.dataLayer || [];
			function gtag(){dataLayer.push(arguments);}
			gtag('js', new Date());
			gtag('config', 'UA-25562592-1');
		</script>

</head>
<body>
<section class="hero">
<div class="hero-head">
<div class="container">
<nav class="navbar has-shadow" role="navigation" aria-label="main navigation">
<div class="navbar-brand">
<a id="unicorn-btn" class="navbar-item" href="https://sindresorhus.com/unicorn" title="Click me!">🦄</a>
<a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false">
<span aria-hidden="true"></span>
<span aria-hidden="true"></span>
<span aria-hidden="true"></span>
</a>
</div>
<div class="navbar-menu">
<div class="navbar-end">
<a class="navbar-item is-tab" href="/">Home</a>
<a class="navbar-item is-tab" href="/#projects">Projects</a>
<a class="navbar-item is-tab" href="/apps">Apps</a>
<a class="navbar-item is-tab" href="/donate">Donate</a>
<a class="navbar-item is-tab" href="/thanks">Supporters</a>
<a class="navbar-item is-tab" href="/about">About</a>
<a class="navbar-item is-tab" href="/contact">Contact</a>
<a class="navbar-item is-tab" href="https://blog.sindresorhus.com">Blog</a>
</div>
</div>
</nav>
</div>
</div>
</section>
<style>
	#latest-repos-container h2 {
		margin-bottom: 2rem;
	}

	#latest-repos h4 {
		margin-bottom: 0.5rem;
	}

	.sponsors {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.sponsors a:not(:first-child) {
		margin-left: 10px;
	}
</style>
<script type="module">
// Temp redirect for old URL
if (location.hash === '#apps') {
	location.hash = '';
	location.pathname = '/apps';
}
</script>
<section class="hero is-fullheight is-default">
<div class="hero-body">
<div id="info-container" class="container has-text-centered">
<div class="columns is-vcentered">
<div class="column is-two-thirds is-centered has-nice-link">
<div itemscope itemtype="http://schema.org/Person">
<img id="profile-pic" src="sindre-sorhus-small.jpg" width="160" height="160" itemprop="image">
<h1 class="title is-2" itemprop="name">Sindre Sorhus</h1>
<h2 class="subtitle is-4" itemprop="description">Full-Time Open-Sourcerer &amp; Aspiring Rebel</h2>
<p>I make lots of modules, CLI tools, and apps. Mostly Swift &amp; Node.js.</p>
</div>
<br>
<p class="has-text-centered">
<a class="button is-large is-white" href="https://blog.sindresorhus.com">
<span class="icon">
<i class="fa fa-pencil"></i>
</span>
<span>Writings</span>
</a>
<a class="button is-large is-white" href="https://github.com/sindresorhus">
<span class="icon">
<i class="fa fa-github"></i>
</span>
<span>Code</span>
</a>
<a class="button is-large is-white" href="https://twitter.com/sindresorhus">
<span class="icon">
<i class="fa fa-twitter"></i>
</span>
<span>Tweets</span>
</a>
</p>
<br>
<a href="/thanks">Huge thanks to all my amazing supporters!</a>
</div>
</div>
</div>
</div>
<div class="hero-foot">
<div class="container">
<div class="tabs is-centered">
<ul>
<li>
<i id="scroll-hint" class="fa fa-caret-down" aria-hidden="true"></i>
</li>
</ul>
</div>
</div>
</div>
</section>
<section class="hero is-fullheight is-gray">
<div id="projects" class="hero-body container">
<div class="columns is-vcentered">
<div class="column has-text-centered">
<img id="unicorn-icon" src="unicorn.svg" width="100" height="100">
<h4 class="title is-4" style="font-weight: 400">Latest commit</h4>
<div id="latest-commit">
<a class="commit-title nice-link" href=""></a>
<br>
<span style="font-size: 12px">
<span class="commit-date"></span> in <a class="repo-title" href=""></a>
</span>
</div>
<br>
<a href="https://gitstalk.netlify.com/sindresorhus">Stalk me</a>
</div>
<div id="latest-repos-container" class="column is-three-fifths is-offset-1 has-nice-link">
<h2 class="title is-2">Latest repos</h2>
<template id="latest-repos-template">
<div class="column is-half">
<h4 class="title is-4">
<a class="latest-repos-title" href=""></a>
<span class="tag is-small latest-repos-language">¯\_(ツ)_/¯</span>
</h4>
<p class="latest-repos-description"></p>
</div>
</template>
<div id="latest-repos" class="columns is-multiline"></div>
</div>
</div>
</div>
</section>
</body>
</html>
