# MALRecGraph
Now available at http://randy-zhou.me/MALRecGraph/

Visualizer for MyAnimeList userrecs.

![alt text](https://raw.githubusercontent.com/rzhou1999/MALRecGraph/master/MALRecGraph.png "(old) MALRecGraph example image")

## Local usage:
For local usage, after cloning and downloading all the dependencies, you will need to set up the backend by running ```python recapi.py``` from within the ```api``` directory. This sets up a server that listens for requests on port 5000 on localhost-- note that the frontend also will need to be changed if you are making changes to the backend because it is currently pointing at my server. After that, open up ```index.html``` on any modern web browser and paste in a MAL link. Clicking any anime on the graph will bring up to 5 other shows that people have recommended as similar into the graph. Right clicking will open that anime in a new tab/window (you may need to enable popups for this).

## Todo(?):
- [x] ~~Add proper documentation (!!).~~ In progress!
- [ ] Separate main.js into smaller, more readable files
- [ ] Add loading bar when waiting for response
- [ ] Optimize web scraping code
- [x] More visual pizazz (edge highlighting, only display related nodes on hover over, etc.)
- [ ] Separate main.js into smaller, more readable files
- [x] Get a starter anime from me! (oh boy, where could this go wrong)
- [ ] Random starter anime feature
- [ ] Use basic NLP to display most important/common phrases of user recommendations when any edge is clicked
- [ ] "Hands-free" mode
- [ ] Better error handling
- [ ] Should probably add a license. I'll figure it out sometime soon.
- [x] Better initial placement of nodes.

## FAQ:
How is this any different from/better than [MALMap](https://igfod13.github.io/MALmap/)?

Wish I knew. I only found out about MALMap after I was almost done with the first version of MALRecGraph. I plan to add some extra functionality (see above), but for the most part... maybe seeing the new anime pop up together is funner, I guess?

Nothing happened after I [entered a MAL link/clicked on a show/etc.]. What gives?

One of two things probably happened here. First, the response might just have not come back yet from the backend. Unfortunately, since MAL's API is down right now, I had to write my own by web scraping the website, which is a bit slower than I'd like. Shows with only 1 or 2 recommendations are usually pretty quick-- shows with 5 might take a while. Second, I might have just made a "f*cky wucky" somewhere in my code. A lot of this was written fairly quickly, so I'd imagine there are still a bunch of bugs to iron out...

## Credits

MALRecGraph is powered by:

[MyAnimeList](https://myanimelist.net/) for the recommendations themselves

[vis.js](http://visjs.org/) for the visualization

[Flask](http://flask.pocoo.org/), [Swagger](https://swagger.io/) and [Connexion](https://connexion.readthedocs.io/en/latest/) for the API

[BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/) for the web scraping

[jQuery](https://jquery.com/) / [jQuery BlockUI](http://malsup.com/jquery/block/) for the modal dialogues

[Flask-CORS](https://flask-cors.readthedocs.io/en/latest/) for enabling CORS

[Octicons](https://octicons.github.com/) for the icons in the top left
