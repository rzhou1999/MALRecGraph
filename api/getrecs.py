from bs4 import BeautifulSoup
import urllib2

#scrapes base malid's page for recommendationsself.
#only takes first five recommendations to reduce waiting time and server strain.
def scrapeRecs(malid):
    response = urllib2.urlopen("https://myanimelist.net/anime/" + str(malid))
    page_source = response.read()
    soup = BeautifulSoup(page_source, 'html.parser')

    temp = soup.find_all("div",class_="anime-slide-outer")[-1].find_all("a", href=True)

    links = list(map(lambda x: x["href"], temp))[:5]

    ids = list(map(lambda x: x[x.rfind("/")+1:].split("-"), links))

    return list(map(lambda x: x[1] if x[0] == str(malid) else x[0], ids))

#deprecated. Has been merged with scrapePicAndName(). Kept here to illustrate similarities and previous
#redundancy between the two.
def scrapePic(malid):
    try:
        response = urllib2.urlopen("https://myanimelist.net/anime/" + str(malid))
    except:
        return ""

    page_source = response.read()
    soup = BeautifulSoup(page_source, 'html.parser')

    images = soup.find_all('img', src=True)
    return list(filter(lambda x: "https://myanimelist.cdn-dena.com/images/anime/" in x['src'], images))[0]['src']

#scrapes malid's page for image and titleself. Returned as list of strings.
#if bad request, returns ["",""].
def scrapePicAndName(malid):
    try:
        response = urllib2.urlopen("https://myanimelist.net/anime/" + str(malid))
    except:
        return ["",""]

    page_source = response.read()
    soup = BeautifulSoup(page_source, 'html.parser')
    images = soup.find_all('img', src=True)
    image = list(filter(lambda x: "https://myanimelist.cdn-dena.com/images/anime/" in x['src'], images))[0]['src'].split(".jpg")[0]+"l.jpg"
    sname = (soup.title.string.rpartition(" - ")[0])[1:]
    return [image,sname]

#for /api/getrecs requests
def read(malid):
    recs = scrapeRecs(malid)
    retVal = []
    for i in recs:
        imgAndName = scrapePicAndName(i)
        if imgAndName[0] == "" or imgAndName[1] == "":
            continue
        retVal.append({
            "surl":"https://myanimelist.net/anime/" + i,
            "simg":imgAndName[0],
            "stitle":imgAndName[1],
            "sid" : i
        })
    return retVal

#for /api/getinfo requests
def readOne(malid):
    imgAndName = scrapePicAndName(malid)
    if imgAndName[0] == "" or imgAndName[1] == "":
        return 'Bad request', 400

    return {
            "surl":"https://myanimelist.net/anime/" + str(malid),
            "simg":imgAndName[0],
            "stitle":imgAndName[1],
            "sid" : malid
        }
