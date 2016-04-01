DEBUG_DIR  = $(shell echo $(abspath $(OUT_DIR)/debug) )
PROGRESSDIR= $(DEBUG_DIR)/status
IN_FILE_COPY = $(OUT_DIR)/$(notdir $(IN_FILE))

conversion: $(PROGRESSDIR)
	echo $(IN_FILE) > $(PROGRESSDIR)/bogo.txt
	cp $(IN_FILE) $(IN_FILE_COPY)
#	chmod 664 $(IN_FILE_COPY)
#	make -C transpect conversion IN_FILE=$(IN_FILE_COPY) OUT_DIR=$(OUT_DIR) 
	make -C transpect $@

progress:
	@find $(PROGRESSDIR) -name '*txt' -not -empty | xargs -r ls -1rt | xargs -d'\n' -I § sh -c 'date "+%H:%M:%S " -r § | tr -d [:cntrl:]; cat §'

$(PROGRESSDIR):
	mkdir -p $@
