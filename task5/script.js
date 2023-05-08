const [w, h, padding] = [1000, 600, 100]
const movie_colors = { 'Action': 'orange', 'Drama': 'green', 'Adventure': 'coral', 'Family': 'lightblue', 'Animation': 'pink', 'Comedy': 'khaki', 'Biography': 'tan' };

const urls = [
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json',
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json',
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json'
];

let get_data = (url) => new Promise((resolve, reject) => {
  fetch(url).then(raw => resolve(raw.json()));
});

Promise.all(urls.map(url => get_data(url))).then(values => {
  drawMap(values);
})

let drawMap = (args) => {

  const title = d3.select('body').append('div').attr('id', 'title').html(
    `<h1>Movie Sales</h1><p id="description">Top 100 Highest Grossing Movies Grouped By Genre</p>`
  );

  console.log('values=', args);
  let [kicks, movies, videos] = [...args];

  let create_hierarchy = (data) => d3.hierarchy(data, (node) => node['children'])
    .sum(node => node['value'])
    .sort((node1, node2) => node2['value'] - node1['value']);

  let [h_kick, h_movie, h_video] = [create_hierarchy(kicks), create_hierarchy(movies), create_hierarchy(videos)];

  let createTreeMap = d3.treemap()
    .size([w, h]);

  createTreeMap(h_movie);
  [kicks, movies, videos] = [h_kick.leaves(), h_movie.leaves(), h_video.leaves()];


  const svg = d3.select('body')
    .append('svg')
    .attr('id', 'chart')
    .attr('height', h)
    .attr('width', w);

  let block_movies = svg.selectAll('g')
    .data(movies)
    .enter()
    .append('g')
    .attr('transform', (movie) => `translate(${movie.x0}, ${movie.y0})`);

  block_movies.append('rect')
    .attr('class', 'tile')
    .attr('fill', movie => movie_colors[movie.data.category])
    .attr('data-name', d => d.data.name)
    .attr('data-category', d => d.data.category)
    .attr('data-value', d => d.data.value)
    .attr('width', movie => movie.x1 - movie.x0)
    .attr('height', movie => movie.y1 - movie.y0)
    .attr('stroke', 'white')
    .attr('stroke-width', '1')
    .on('mouseover', (event, d) => {
      tooltip
        .style('visibility', 'visible')
        .attr('opacity', '0.8')
        .attr('data-value', d.data.value)
        .html(
          `<p>Name: ${d.data.name}</br>
  Category: ${d.data.category}</br>
    Value: ${d.data.value}</p>`
        )
        .style('top', `${event.clientY - 20}px`)
        .style('left', `${event.clientX + 20}px`);
    })
    .on('mouseout', (event, d) => {
      tooltip
        .style('visibility', 'hidden')
        .attr('opacity', '0');
    });

  block_movies.append('text')
    .text(movie => movie.data.name)
    .attr('font-size', '15')
    .attr('x', 5)
    .attr('y', 15);

  const legend = d3.select('body').append('svg').attr('id', 'legend').attr('width', w).attr('height', h * 0.3);
  const legend_item = legend.selectAll('g')
    .data(Object.keys(movie_colors))
    .enter()
    .append('g');

  let tempx = -1;
  let tempy = 0;
  let count = 0;

  legend_item.append('rect')

    .attr('class', 'legend-item')
    .attr('x', (d, i) => {
      if (i % 3 == 0 && i !== 0) {
        tempx = 0;
      } else {
        tempx++;
      }
      console.log('return is', tempx * padding);
      return tempx * 1.5 * padding;
    })
    .attr('y', (d, i) => {
      if (i % 3 == 0 && i !== 0) {
        count++;
        tempy = 0;
      } else { tempy++; }
      console.log('count=', count);
      console.log('i=', i);
      console.log('tempy=', tempy);
      console.log('return is: ', 20 * (count + 1));
      return 30 * (count + 1);
    })
    .attr('fill', (d, i) => movie_colors[d])
    .attr('height', 20)
    .attr('width', 20);

  tempx = -1;
  tempy = 0;
  count = 0;
  legend_item.append('text')
    .attr('x', (d, i) => {
      if (i % 3 == 0 && i !== 0) {
        tempx = 0;
      } else {
        tempx++;
      }
      console.log('return is', tempx * padding);
      return tempx * 1.5 * padding + 30;
    })
    .attr('y', (d, i) => {
      if (i % 3 == 0 && i !== 0) {
        count++;
        tempy = 0;
      } else { tempy++; }
      console.log('count=', count);
      console.log('i=', i);
      console.log('tempy=', tempy);
      console.log('return is: ', 20 * (count + 1));
      return 30 * (count + 1) + 15;
    })
    .text(d => d);

  let tooltip = d3.select('body')
    .append('div')
    .attr('id', 'tooltip')
    .attr('visibility', 'hidden')
    .attr('opacity', '0');
};