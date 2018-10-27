from bs4 import BeautifulSoup
import urllib2
import time

#used for initial testing and benchmarking speed.

malid = "5081"

start = time.time()
response = urllib2.urlopen("https://myanimelist.net/anime/" + malid)
page_source = response.read()
soup = BeautifulSoup(page_source, 'html.parser')

print soup.prettify()
print(time.time() - start)
start = time.time()

temp = soup.find_all("div",class_="anime-slide-outer")[-1].find_all("a", href=True)

links = list(map(lambda x: x["href"], temp))[:5]

print links
print(time.time() - start)
start = time.time()

ids = list(map(lambda x: x[x.rfind("/")+1:].split("-"), links))

print ids
print(time.time() - start)
start = time.time()

final = list(map(lambda x: "https://myanimelist.net/anime/" + (x[1] if x[0] == malid else x[0]), ids))

print final
print(time.time() - start)
start = time.time()

for i in range(len(final)):
    response = urllib2.urlopen(final[i])
    page_source = response.read()
    soup = BeautifulSoup(page_source, 'html.parser')

    images = soup.find_all('img', src=True)
    print [list(filter(lambda x: "https://myanimelist.cdn-dena.com/images/anime/" in x['src'], images))[0]['src'],soup.title.string.split(" - ")[0]]

print(time.time() - start)
start = time.time()
