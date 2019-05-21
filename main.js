var margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = 600 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    cell_size = 28;


d3.csv("musicReduced.csv", function(csv) {
    for (var i=0; i<csv.length; ++i) {
        csv[i]["year"] = Number(csv[i]["year"]);
        csv[i]["total_in_genre"] = Number(csv[i]["total_in_genre"]);
    }
    var genres = d3.nest()
        .key(function(d) { return d.terms; })
        .entries(csv)

    var decades = d3.nest()
        .key(function(d) { return (Math.floor((d.year)/10)*10)
        })
        .entries(csv)

    var div = d3.select("body").append("div")
                            .attr("class", "tooltip")
                            .style("opacity", 0);


    function update_grid(decade) {
        var content = d3.select('#content')
            // .attr('width', width)
            // .attr('height', height)

        var genre_map = new Map();
        var decade_data = decades[decade].values;
        var top_genre = '';
        var top_genre_size = 0;
        for (var i = 0; i < decade_data.length; i++) {
            var term = decade_data[i]['terms'];
            if (genre_map.has(term)) {
                genre_map.set(term, genre_map.get(term)+1)
                if (top_genre_size < genre_map.get(term)) {
                    top_genre = term;
                    top_genre_size = genre_map.get(term);
                }
            } else {
                genre_map.set(term, 1)
            }
        }


        cur_decade = decades[decade]
        decade_name = cur_decade.key
        var hottest_artist = '';
        var hottest_artist_val = 0;
        var hottest_song = '';
        var hottest_song_val = 0;
        var hottest_song_artist = '';
        var average_loudness = 0;
        var average_duration = 0;
        var average_tempo = 0;
        var average_time_signature = 0;
        var average_time_val = 0;
        var average_key = 0;
        var average_key_val = 0;
        var time_sig_map = new Map();
        var key_sig_map = new Map();

        for (var i = 0; i < cur_decade.values.length; i++) {
            data_point = cur_decade.values[i];
            if (data_point['artist.hotttnesss'] > hottest_artist_val) {
                hottest_artist_val = data_point['artist.hotttnesss'];
                hottest_artist = data_point['artist.name'];
            }
            if (data_point['song.hotttnesss'] > hottest_song_val) {
                hottest_song_val = data_point['song.hotttnesss'];
                hottest_song = data_point['title'];
                hottest_song_artist = data_point['artist.name']
            }
            average_loudness += +data_point['loudness'];
            average_duration += +data_point['duration'];
            average_tempo += +data_point['tempo'];

            // Use maps to find most common key and time signature
            var key = data_point['key'];
            var time = data_point['time_signature']
            if (key_sig_map.has(key)) {
                key_sig_map.set(key, key_sig_map.get(key)+1)
                if (average_key_val < key_sig_map.get(key)) {
                    average_key = key;
                    average_key_val = key_sig_map.get(key);
                }
            } else {
                key_sig_map.set(key, 1)
            }

            if (time_sig_map.has(time)) {
                time_sig_map.set(time, time_sig_map.get(time)+1)
                if (average_time_val < time_sig_map.get(time)) {
                    average_time_signature = time;
                    average_time_val = time_sig_map.get(time);
                }
            } else {
                time_sig_map.set(time, 1)
            }
        }

        average_loudness = Math.ceil((average_loudness/cur_decade.values.length)*100)/100;
        average_duration = Math.ceil((average_duration/cur_decade.values.length)*100)/100;
        average_tempo = Math.ceil((average_tempo/cur_decade.values.length)*100)/100;

        key_array = ['C', 'C-Sharp', 'D', 'E-Flat', 'E', 'F', 'F-Sharp',
                    'G', 'A-Flat', 'A', 'B-Flat', 'B'];

        // Fill in tags
        d3.select('#content').append('h1')
            .attr('class', 'decade')
            .text(decade_name + "'s")
        d3.select('#content').append('h2')
            .attr('class', 'common-genre')
            .text('Most Common Genre: ' + top_genre)
        d3.select('#content').append('h2')
            .attr('class', 'hottest-artist')
            .text('Hottest Artist: ' + hottest_artist)
        if (hottest_song != ''){
            d3.select('#content').append('h2')
                .attr('class', 'hottest-song')
                .text('Hottest Song: ' + hottest_song + ' by ' + hottest_song_artist)
        }
        d3.select('#content').append('h2')
            .attr('class', 'song-makeup')
            .text("Average Song Makeup")
        d3.select('#content').append('h3')
            .attr('class', 'key')
            .text('Key: ' + key_array[average_key])
        d3.select('#content').append('h3')
            .attr('class', 'loudness')
            .text('Loudness: ' + average_loudness + ' dB')
        d3.select('#content').append('h3')
            .attr('class', 'duration')
            .text('Duration: ' + average_duration + ' Seconds')
        d3.select('#content').append('h3')
            .attr('class', 'tempo')
            .text('Tempo: ' + average_tempo + ' BPM')
        d3.select('#content').append('h3')
            .attr('class', 'time-signature')
            .text('Time Signature: ' + average_time_signature + ' Beats Per Bar')

        decade == 9?d3.select('#content').append('div').attr('class', 'spacing9'):d3.select('#content').append('div').attr('class', 'spacing')


        // 23x15 grid for 345 genres
        var grid_array = new Array();
        var xpos = 1;
        var ypos = 1;
        var i = 0;
        for (var row = 0; row < 23; row++) {
            grid_array.push( new Array() );
            for (var column = 0; column < 15; column++) {
                var color = (genre_map.has(genres[i].key) ? (genre_map.get(genres[i].key) + 20) * 2 : 0);
                grid_array[row].push({
                    x: xpos,
                    y: ypos,
                    width: cell_size,
                    height: cell_size,
                    data: genres[i],
                    value: (genre_map.has(genres[i].key)) ? (genre_map.get(genres[i].key)) : 0,
                    fill: d3.rgb(255, 255-color, 255-color)
                })
                i += 1;
                xpos += cell_size;
            }
            xpos = 1;
            ypos += cell_size;
        }

        var id_name = String('grid' + decade)

        var grid = d3.select('#main-div')
            .append('svg')
            .attr('id', id_name)
            .attr('class', 'grid')
            .attr('width', width)
            .attr('height', height);

        var row = grid.selectAll('.row')
            .data(grid_array)
            .enter().append('g')
            .attr('class', 'row')

        var column = row.selectAll('.square')
            .data(function(d) { return d; })
            .enter().append('rect')
            .attr('class', 'square')
            .attr('x', function(d) { return d.x; })
            .attr('y', function(d) { return d.y; })
            .attr('width', function(d) { return d.width; })
            .attr('height', function(d) { return d.height; })
            .style('fill', function(d) { return d.fill; })
            .style('stroke', function(d) { return (d.fill.b != 255 ? 'darkred' : 'black')})
            .on("mouseover", function(d) {
                div.transition()
                    .duration(100)
                    .style("opacity", .9);
                div	.html(d.data.key + "<br/>" + "Songs this decade: " + +d.value)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
                })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }

    $(document).scroll(function() {
        for (var i = 0; i < 10; i++) {
            var cur_id = String('#grid' + i);
            var $grid = $(cur_id);
            var content_size = 1350;
            $grid.css({display: $(this).scrollTop() >= (content_size*(i-1))+800? 'block':'none'});
        }
    });

    update_grid(0);
    update_grid(1);
    update_grid(2);
    update_grid(3);
    update_grid(4);
    update_grid(5);
    update_grid(6);
    update_grid(7);
    update_grid(8);
    update_grid(9);
    d3.selectAll('.grid').style('display', 'none');
    d3.select('#grid0').style('display', 'block');

});
