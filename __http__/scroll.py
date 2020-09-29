def page_scroll(self):
        lastHeight = self.driver.execute_script("return document.body.scrollHeight")
        time.sleep(5)
        while True:
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(5)
            newHeight = self.driver.execute_script("return document.body.scrollHeight")
            if newHeight == lastHeight:
                break
            lastHeight = newHeight
        time.sleep(5)