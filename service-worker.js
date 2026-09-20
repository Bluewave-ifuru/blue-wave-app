const CACHE_NAME = "blue-wave-shell-v25";

const APP_SHELL = [
  "./",
  "./index.html",
  "./scheduler.html",
  "./booking.html",
  "./tripadvisor.html",
  "./tripadvisor-poster.png",
  "./bluewave-logo.jpg",
  "./instagram-qr.png",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

/* INSTALL */

self.addEventListener("install", event => {

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache =>
        cache.addAll(APP_SHELL)
      )
  );

  self.skipWaiting();

});


/* ACTIVATE */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches
      .keys()
      .then(keys =>

        Promise.all(

          keys
            .filter(
              key =>
                key !== CACHE_NAME
            )
            .map(
              key =>
                caches.delete(key)
            )

        )

      )

  );

  self.clients.claim();

});


/* FETCH */

self.addEventListener("fetch", event => {

  if (
    event.request.method !== "GET"
  ) {
    return;
  }


  const request = event.request;

  const url =
    new URL(request.url);


  /*
    HTML / PAGE NAVIGATION

    Always try the newest version
    from the internet first.
  */

  if (
    request.mode === "navigate" ||
    url.pathname.endsWith(".html")
  ) {

    event.respondWith(

      fetch(
        request,
        {
          cache: "no-store"
        }
      )

        .then(response => {

          const copy =
            response.clone();

          caches
            .open(CACHE_NAME)
            .then(cache =>
              cache.put(
                request,
                copy
              )
            );

          return response;

        })

        .catch(() =>
          caches.match(request)
        )

    );

    return;
  }


  /*
    OTHER FILES

    Network first,
    cache as fallback.
  */

  event.respondWith(

    fetch(request)

      .then(response => {

        const copy =
          response.clone();

        caches
          .open(CACHE_NAME)
          .then(cache =>
            cache.put(
              request,
              copy
            )
          );

        return response;

      })

      .catch(() =>
        caches.match(request)
      )

  );

});
