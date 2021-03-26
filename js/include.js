function include(filename)
{
    var script = document.createElement('script');
    script.src = `js/${filename}`;
    script.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(script);
}