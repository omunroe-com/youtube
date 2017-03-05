define(`<div id="left" class="column">
	<div class="header">
		<div id="controls">
			<div id="prev" class="button"><svg width="34" height="34">
				<polyline points="02,17  17,02  17,32"></polyline>
				<polyline points="17,17  32,02  32,32"></polyline>
			</svg></div>
			<div id="play" class="button"><svg width="34" height="34">
				<polyline points="07,02  07,32  27,17"></polyline>
			</svg></div>
			<div id="pause" class="button active"><svg width="34" height="34">
				<polyline points="04,02  13,02  13,32  04,32"></polyline>
				<polyline points="19,02  28,02  28,32  19,32"></polyline>
			</svg></div>
			<div id="next" class="button"><svg width="34" height="34">
				<polyline points="02,02  02,32  17,17"></polyline>
				<polyline points="17,02  17,32  32,17"></polyline>
			</svg></div>
			<div id="loop" class="button">
				<div>↻</div>
			</div>
			<div id="more" class="button">
				<div>⋮</div>
			</div>
		</div>
	</div>
	<div class="body">
		<div class="load-spinner"></div>
		<div id="playlist" class="scroll-outer">
			<div class="scroll-inner">
				<span class="tabs">
					<div class="tab tab-default video-default">
						<div class="icon" style="background-image: url('');"></div>
						<div class="description">
							<span class="title">
								...
							</span>
							<span class="duration">
								-:--
							</span>
							<div class="remove">⨉</div>
						</div>
					</div>
					<!-- ... -->
				</span>
			</div>
		</div>
	</div>
</div>
<div id="right" class="column">
	<div class="header">
		<div id="searchbox">
			<input placeholder="Search ...">
			<div class="remove">⨉</div>
		</div>
	</div>
	<div class="body">
		<div class="load-spinner"></div>
		<div id="windows" class="windows scroll-outer">
			<div class="scroll-inner">
				<span class="windows">
					<div id="window-default" class="window">
						<div class="header">
							<label class="toggleswitch title" for="windowToggle-default">title</label>
						</div>
						<input type="checkbox" class="toggleswitch" id="windowToggle-default"/>
						<span class="tabs">
							<!-- ... -->
						</span>
					</div>
					<!-- ... -->
				</span>
			</div>
		</div>
	</div>
</div>`);
