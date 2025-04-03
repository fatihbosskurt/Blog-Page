import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let blogPosts = [];

// Funktion zum Erstellen eines URL-freundlichen Slugs aus dem Titel
function createSlug(title) {
  return title
    .normalize("NFD") // Entfernt Akzente (z.B. é → e)
    .replace(/[\u0300-\u036f]/g, "") // Entfernt Unicode-Diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Entfernt Sonderzeichen außer Leerzeichen und Bindestriche
    .replace(/\s+/g, "-") // Ersetzt Leerzeichen durch Bindestriche
    .replace(/-+/g, "-"); // Doppelte Bindestriche vermeiden
}

// Startseite mit allen Blogposts
app.get("/", (req, res) => {
  res.render("index.ejs", { blogPosts: blogPosts });
});

// Einzelnen Blogpost anzeigen
app.get("/posts/:slug", (req, res) => {
  const postSlug = req.params.slug;
  const post = blogPosts.find(p => p.slug === postSlug);
  
  if (post) {
    res.render("posts.ejs", { title: post.title, content: post.content, slug: post.slug });
  } else {
    res.status(404).send("Post nicht gefunden");
  }
});

// Blogpost erstellen
app.post("/submit", (req, res) => {
  const newPost = {
    title: req.body.title,
    content: req.body.content,
    slug: createSlug(req.body.title)
  };
  blogPosts.push(newPost);
  res.redirect("/");
});

// Blogpost bearbeiten
app.post("/posts/:slug", (req, res) => {
  const postSlug = req.params.slug;
  const updatedTitle = req.body.title;
  const updatedContent = req.body.content;
  const postIndex = blogPosts.findIndex(p => p.slug === postSlug);

  if (postIndex !== -1) {
    blogPosts[postIndex].title = updatedTitle;
    blogPosts[postIndex].content = updatedContent;
    blogPosts[postIndex].slug = createSlug(updatedTitle); // Slug aktualisieren

    res.redirect(`/posts/${encodeURIComponent(blogPosts[postIndex].slug)}`);
  } else {
    res.status(404).send("Post nicht gefunden");
  }
});

// Blogpost löschen
app.post("/posts/delete/:slug", (req, res) => {
  const postSlug = req.params.slug;
  blogPosts = blogPosts.filter(p => p.slug !== postSlug);
  res.redirect("/");
});

// Server starten
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
