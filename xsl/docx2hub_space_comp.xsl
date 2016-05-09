<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:orig="http://www.le-tex.de/namespace"
  xmlns:css="http://www.w3.org/1996/css"
  xmlns:adhcss="http://transpect.io/adhcss"
  xmlns:dbk="http://docbook.org/ns/docbook"
  xmlns:sm="http://transpect.io/stylemapper"
  exclude-result-prefixes="#all"
  xpath-default-namespace="http://docbook.org/ns/docbook"
  version="2.0">
  <xsl:template match="*|@*">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>
  <xsl:function name="css:length-to-double" as="xs:double">
    <xsl:param name="length" as="xs:string?"/>
    <xsl:sequence select="(
                            for $m in $length 
                              return number(replace($m, '[^\d.]', '')),
                            0
                          )[1]"/>
  </xsl:function>
<!--  summarize all height relevant @ from following empty paragraphs and add the result to the preceeding paragraphs @margin-bottom -->
  <xsl:template match="para[following-sibling::para[1][not(./node()) and not(./text())]][exists(./text())]">
    <xsl:copy>
      <xsl:variable name="position"
        select="count(preceding-sibling::para[following-sibling::para[1][not(./node()) and not(./text())]][exists(./text())])+ (if (//para[1][not(exists(./text()))]) then 2 else 1)"
      />
      <xsl:apply-templates select="@*"></xsl:apply-templates>
      <xsl:variable name="computed_space" as="xs:double*">
      <xsl:for-each-group select="../para[not(./node()) and not(./text())]" group-ending-with="para[following-sibling::para[1][exists(./text())]]">
          <xsl:variable name="line-height">
              <xsl:value-of select="sum(for $i in (current-group()) return css:length-to-double($i/@css:line-height)*css:length-to-double($i/@css:font-size))"></xsl:value-of>
          </xsl:variable>
          <xsl:value-of
            select="
          sum((
                              current-group()/css:length-to-double(./@css:margin-bottom),
                              current-group()/css:length-to-double(./@css:margin-top),
                              current-group()/css:length-to-double(./@css:font-size)
                                                            )) + sum($line-height)
         "/>
      </xsl:for-each-group>
      </xsl:variable>
      <xsl:attribute name="css:orig-margin-bottom" select="@css:margin-bottom"></xsl:attribute>
      <xsl:attribute name="css:margin-bottom" select="concat(string(($computed_space[$position]+ css:length-to-double(@line-height) + css:length-to-double(@css:margin-bottom))), 'pt')"></xsl:attribute>
      <xsl:apply-templates select="node()"></xsl:apply-templates>
    </xsl:copy>
  </xsl:template>
<!-- height compensation in case of empty paragraphs in the beginning of the document. the first text containing paragraph receives the compensated space to its @margin-top   -->
  <xsl:template match="para[preceding-sibling::para[1][not(./node()) and not(./text())]][exists(./text())][./position() = 1][not(exists(preceding-sibling::para[./text()]))]" priority="3">
    <xsl:copy>
      <xsl:apply-templates select="@*"/>
      <xsl:variable name="computed_space" as="xs:double*">
      <xsl:for-each select="./preceding-sibling::para[not(./node()) and not(./text())]">
          <xsl:variable name="line-height">
              <xsl:value-of select="css:length-to-double(@css:line-height)*css:length-to-double(@css:font-size)"></xsl:value-of>
          </xsl:variable>
          <xsl:value-of
            select="
          sum((
                              ./css:length-to-double(./@css:margin-bottom),
                              ./css:length-to-double(./@css:margin-top),
                              ./css:length-to-double(./@css:font-size),
                              $line-height
                                                            ))
         "/>
      </xsl:for-each>
      </xsl:variable>
      <xsl:attribute name="css:orig-margin-top" select="@css:margin-top"></xsl:attribute>
      <xsl:attribute name="css:margin-top" select="concat(string(sum(($computed_space, css:length-to-double(@css:margin-top)))), 'pt')"></xsl:attribute>
      <xsl:apply-templates select="node()"></xsl:apply-templates>
    </xsl:copy>
  </xsl:template>
  
  <xsl:template match="para[not(./node()) and not(./text())]" priority="3"/>

</xsl:stylesheet>